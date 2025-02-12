import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { getRoutePathFromVaultPath } from '@/lib/note';
import { createRedisClient } from '@/lib/redis';
import { ASSETS_FOLDER } from '@/lib/server/server-constants';
import { unlink, writeFile } from 'fs/promises';
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

  return file.arrayBuffer().then(async arrayBuffer => {
    const buffer = Buffer.from(arrayBuffer);

    return writeFile(diskPath, buffer, { encoding: 'utf-8' }).then(() => {
      log.info(
        {
          vaultPath,
          diskPath,
        },
        'File created',
      );

      return Promise.all([
        redis
          .hSet(
            RK.FILES,
            vaultPath,
            JSON.stringify({
              md5,
              extension,
              diskPath,
              lastModified,
            }),
          )
          .then(() => log.debug(`Add ${vaultPath} to ${RK.FILES}`)),
        redis
          .set(
            `${RK.PATH_MAPPING}${getRoutePathFromVaultPath(vaultPath)}`,
            vaultPath,
          )
          .then(() => log.debug(`Set path mapping of ${vaultPath}`)),
        redis
          .sAdd(RK.PATHS, vaultPath)
          .then(() => log.debug(`Add ${vaultPath} to ${RK.PATHS}`)),
      ]);
    });
  });
};

const handleDeleted = async (params: Params) => {
  const { vaultPath } = params;
  const fileStat = await redis.hGet(RK.FILES, vaultPath);
  const promises: Promise<void>[] = [];

  if (fileStat) {
    const { diskPath } = JSON.parse(fileStat);

    const p1 = unlink(diskPath)
      .then(() => {
        log.info(
          {
            vaultPath,
            diskPath,
          },
          'File deleted',
        );
      })
      .catch(e => {
        log.error(`Failed to delete file: ${e}`);
      });
    promises.push(p1);
  }

  const p2 = redis
    .hDel(RK.FILES, vaultPath)
    .then(() => log.debug(`Remove ${vaultPath} from ${RK.FILES}`));
  const p3 = redis
    .del(`${RK.PATH_MAPPING}${getRoutePathFromVaultPath(vaultPath)}`)
    .then(() => log.debug(`Remove ${vaultPath} from ${RK.PATH_MAPPING}`));
  const p4 = redis
    .sRem(RK.PATHS, vaultPath)
    .then(() => log.debug(`Remove ${vaultPath} from ${RK.PATHS}`));

  promises.push(p2, p3, p4);

  return Promise.all(promises);
};

const handleRenamed = async (params: Params) => {
  const { extension, file, lastModified, vaultPath, oldPath } = params;

  if (!oldPath) {
    log.error(
      'Failed to perform rename sync, file stat of old path not exists',
    );
    return;
  }

  const fileStat = await redis.hGet(RK.FILES, oldPath);
  if (!fileStat) {
    log.error('Failed to perform rename sync, old path not exists');
    return;
  }

  const { md5, diskPath } = JSON.parse(fileStat);
  const newDiskPath = path.join(ASSETS_FOLDER, `${md5}.${extension}`);

  return file.arrayBuffer().then(async arrayBuffer => {
    const promises: Promise<void>[] = [];

    const buffer = Buffer.from(arrayBuffer);

    const p1 = writeFile(newDiskPath, buffer, { encoding: 'utf-8' }).catch();
    const p2 = unlink(diskPath).catch();

    log.info(
      {
        oldPath,
        vaultPath,
        diskPath,
      },
      'File renamed',
    );

    const p3 = redis
      .hDel(RK.FILES, oldPath)
      .then(() => {})
      .catch();
    const p4 = redis
      .sRem(RK.PATHS, oldPath)
      .then(() => {})
      .catch();
    const p5 = redis
      .del(`${RK.PATH_MAPPING}${getRoutePathFromVaultPath(oldPath)}`)
      .then(() => {})
      .catch();
    const p6 = redis
      .hSet(
        RK.FILES,
        vaultPath,
        JSON.stringify({
          md5,
          extension,
          diskPath: newDiskPath,
          lastModified,
        }),
      )
      .then(() => {})
      .catch();
    const p7 = redis
      .set(
        `${RK.PATH_MAPPING}${getRoutePathFromVaultPath(vaultPath)}`,
        vaultPath,
      )
      .then(() => {})
      .catch();
    const p8 = redis.sAdd(RK.PATHS, vaultPath).then(() => {});

    promises.push(p1, p2, p3, p4, p5, p6, p7, p8);

    return Promise.all(promises);
  });
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
