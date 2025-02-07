import { RK } from '@/lib/constants';
import { getExt } from '@/lib/file';
import { logger } from '@/lib/logger';
import { getNoteTreeView, getRoutePathFromVaultPath } from '@/lib/note';
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
      msg: 'Behavior is null, do nothing',
    });
  }

  const vaultPath = formData.get('path') as string;

  if (behavior === 'created' || behavior === 'modified') {
    const md5 = formData.get('md5') as string;
    const extension = formData.get('extension') as string;
    const file = formData.get('file') as File;
    const lastModified = formData.get('lastModified') as string;

    const diskPath = path.join(ASSETS_FOLDER, `${md5}.${extension}`);
    file.arrayBuffer().then(async arrayBuffer => {
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(diskPath, buffer, { encoding: 'utf-8' });

      log.info(
        {
          vaultPath,
          md5,
          diskPath,
        },
        'File created',
      );
    });

    await redis.hSet(
      RK.FILES,
      vaultPath,
      JSON.stringify({
        md5,
        extension,
        diskPath,
        lastModified,
      }),
    );

    await redis.set(
      `${RK.PATH_MAPPING}${getRoutePathFromVaultPath(vaultPath)}`,
      vaultPath,
    );
  } else if (behavior === 'deleted') {
    const fileStat = await redis.hGet(RK.FILES, vaultPath);

    if (fileStat) {
      const { md5, diskPath } = JSON.parse(fileStat);
      await redis.hDel(RK.FILES, vaultPath);
      fs.unlinkSync(diskPath);

      log.info(
        {
          vaultPath,
          md5: md5,
          diskPath,
        },
        'File deleted',
      );
    }

    await redis.del(
      `${RK.PATH_MAPPING}${getRoutePathFromVaultPath(vaultPath)}`,
    );
  } else if (behavior === 'renamed') {
    const oldPath = formData.get('oldPath') as string;
    const file = formData.get('file') as File;
    const lastModified = formData.get('lastModified') as string;
    const extension = formData.get('extension') as string;

    if (oldPath) {
      const fileStat = await redis.hGet(RK.FILES, oldPath);

      if (fileStat) {
        const { md5, diskPath } = JSON.parse(fileStat);
        const newDiskPath = path.join(ASSETS_FOLDER, `${md5}.${extension}`);
        file.arrayBuffer().then(async arrayBuffer => {
          const buffer = Buffer.from(arrayBuffer);
          fs.writeFileSync(newDiskPath, buffer, { encoding: 'utf-8' });
          log.info(
            {
              vaultPath,
              md5,
              diskPath,
            },
            'Renamed file created',
          );
        });

        fs.unlinkSync(diskPath);
        await redis.hDel(RK.FILES, oldPath);
        await redis.del(
          `${RK.PATH_MAPPING}${getRoutePathFromVaultPath(oldPath)}`,
        );
        await redis.hSet(
          RK.FILES,
          vaultPath,
          JSON.stringify({
            md5,
            extension,
            diskPath: newDiskPath,
            lastModified,
          }),
        );
        await redis.set(
          `${RK.PATH_MAPPING}${getRoutePathFromVaultPath(vaultPath)}`,
          vaultPath,
        );

        log.info(
          {
            vaultPath,
            oldPath,
          },
          'File renamed',
        );
      } else {
        const msg =
          'Failed to perform rename sync, file stat of old path not exists';
        log.error(msg);
        return NextResponse.json({
          msg: msg,
        });
      }
    } else {
      const msg = 'Failed to perform rename sync, old path not exists';
      log.error(msg);
      return NextResponse.json({
        msg: msg,
      });
    }
  } else {
    return NextResponse.json({
      msg: 'Unknown behavior',
    });
  }

  log.info('Rebuild tree view');
  const allFiles = await redis.hKeys(RK.FILES);
  const treeView = getNoteTreeView(
    allFiles.map(file => {
      return {
        path: file,
        ext: getExt(file),
        lastModified: undefined,
      };
    }),
  );
  await redis.json.set(RK.TREE_VIEW, '$', treeView as any);

  return NextResponse.json({
    msg: 'Sync successfully',
  });
}
