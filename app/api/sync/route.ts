import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';
import { ASSETS_FOLDER } from '@/lib/server/server-constants';
import fs from 'fs';
import { NextResponse } from 'next/server';
import path from 'path';

const log = logger.child({
  module: 'api',
  route: '/api/sync',
});

const redis = await createRedisClient();

export async function POST(request: Request) {
  const formData = await request.formData();

  const behavior = formData.get('behavior');

  if (!behavior) {
    return NextResponse.json({
      data: null,
      msg: 'behavior is null, do nothing',
    });
  }

  const filepathInVault = formData.get('path') as string;

  if (behavior === 'created' || behavior === 'modified') {
    const md5 = formData.get('md5') as string;
    const extension = formData.get('extension') as string;
    const file = formData.get('file') as File;
    const exists = formData.get('exists') === 'true';

    const filepathOnDisk = path.join(ASSETS_FOLDER, `${md5}.${extension}`);

    if (!exists) {
      file.arrayBuffer().then(async arrayBuffer => {
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filepathOnDisk, buffer, { encoding: 'utf-8' });

        log.info(
          {
            path: filepathInVault,
            md5: md5,
            filepath: filepathOnDisk,
          },
          'File created',
        );
      });
    } else {
      log.info(
        {
          path: filepathInVault,
          md5: md5,
          filepath: filepathOnDisk,
        },
        'File already exists',
      );
    }

    await redis.hSet(
      RK.FILES,
      filepathInVault,
      JSON.stringify({
        md5,
        extension,
        filepath: filepathOnDisk,
      }),
    );
    await redis.sAdd(`${RK.MD5}${md5}`, filepathInVault);
  } else if (behavior === 'deleted') {
    const fileDetails = await redis.hGet(RK.FILES, filepathInVault);

    if (fileDetails) {
      const { md5, filepath } = JSON.parse(fileDetails);
      await redis.sRem(`${RK.MD5}${md5}`, filepathInVault);
      await redis.hDel(RK.FILES, filepathInVault);
      fs.unlinkSync(filepath);

      log.info(
        {
          path: filepathInVault,
          md5: md5,
          filepath,
        },
        'File deleted',
      );
    }
  } else if (behavior === 'renamed') {
    const oldPath = formData.get('oldPath') as string;

    if (oldPath) {
      const fileDetails = await redis.hGet(RK.FILES, oldPath as string);

      if (fileDetails) {
        const { md5, filepath } = JSON.parse(fileDetails);
        await redis.sRem(`${RK.MD5}${md5}`, oldPath);
        await redis.sAdd(`${RK.MD5}${md5}`, filepathInVault);
        await redis.hDel(RK.FILES, oldPath);
        await redis.hSet(RK.FILES, filepathInVault, fileDetails);
        fs.unlinkSync(filepath);

        log.info(
          {
            path: filepathInVault,
            oldPath,
          },
          'File renamed',
        );
      } else {
        log.warn(
          'Failed to perform rename sync, file details of old path not exists',
        );
      }
    } else {
      log.warn('Failed to perform rename sync, oldPath not exists');
    }
  } else {
    // do nothing
  }

  return NextResponse.json({
    data: null,
    msg: 'success',
  });
}
