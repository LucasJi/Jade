import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { getRoutePathFromVaultPath } from '@/lib/note';
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

interface Params {
  status: string;
  vaultPath: string;
  md5: string;
  extension: string;
  file: File;
  oldPath: string;
  lastModified: string;
}

const getParamsFromFormData = (formData: FormData): Params => {
  const status = formData.get('status') as string;
  const vaultPath = formData.get('path') as string;
  const md5 = formData.get('md5') as string;
  const extension = formData.get('extension') as string;
  const file = formData.get('file') as File;
  const lastModified = formData.get('lastModified') as string;
  const oldPath = formData.get('oldPath') as string;

  return {
    status,
    vaultPath,
    md5,
    extension,
    file,
    lastModified,
    oldPath,
  };
};

const handleCreatedAndModified = async (params: Params) => {
  const { md5, extension, file, lastModified, vaultPath } = params;
  const diskPath = path.join(ASSETS_FOLDER, `${md5}.${extension}`);

  file.arrayBuffer().then(async arrayBuffer => {
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFileSync(diskPath, buffer, { encoding: 'utf-8' });

    log.info(
      {
        vaultPath,
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
  await redis.sAdd(RK.PATHS, vaultPath);
};

const handleDeleted = async (params: Params) => {
  const { vaultPath } = params;
  const fileStat = await redis.hGet(RK.FILES, vaultPath);

  if (fileStat) {
    const { diskPath } = JSON.parse(fileStat);

    fs.unlinkSync(diskPath);

    log.info(
      {
        vaultPath,
        diskPath,
      },
      'File deleted',
    );
  }

  await redis.hDel(RK.FILES, vaultPath);
  await redis.del(`${RK.PATH_MAPPING}${getRoutePathFromVaultPath(vaultPath)}`);
  await redis.sRem(RK.PATHS, vaultPath);
};

const handleRenamed = async (params: Params) => {
  const { extension, file, lastModified, vaultPath, oldPath } = params;

  if (oldPath) {
    const fileStat = await redis.hGet(RK.FILES, oldPath);

    if (fileStat) {
      const { md5, diskPath } = JSON.parse(fileStat);
      const newDiskPath = path.join(ASSETS_FOLDER, `${md5}.${extension}`);

      file.arrayBuffer().then(async arrayBuffer => {
        const buffer = Buffer.from(arrayBuffer);

        fs.writeFileSync(newDiskPath, buffer, { encoding: 'utf-8' });
        fs.unlinkSync(diskPath);

        log.info(
          {
            oldPath,
            vaultPath,
            diskPath,
          },
          'File renamed',
        );
      });

      await redis.hDel(RK.FILES, oldPath);
      await redis.sRem(RK.PATHS, oldPath);
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
      await redis.sAdd(RK.PATHS, vaultPath);
    } else {
      const msg =
        'Failed to perform rename sync, file stat of old path not exists';
      log.error(msg);
    }
  } else {
    const msg = 'Failed to perform rename sync, old path not exists';
    log.error(msg);
  }
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const params = getParamsFromFormData(formData);
  const { status } = params;

  switch (status) {
    case 'created':
    case 'modified':
      await handleCreatedAndModified(params);
      break;
    case 'deleted':
      await handleDeleted(params);
      break;
    case 'renamed':
      await handleRenamed(params);
      break;
    default:
      return NextResponse.json({
        msg: 'Unknown status',
      });
  }

  return NextResponse.json({
    msg: 'Sync completed',
  });
}
