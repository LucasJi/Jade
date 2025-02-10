import { RK } from '@/lib/constants';
import { getExt } from '@/lib/file';
import { logger } from '@/lib/logger';
import { getNoteTreeView, getRoutePathFromVaultPath } from '@/lib/note';
import { createRedisClient } from '@/lib/redis';
import { ASSETS_FOLDER } from '@/lib/server/server-constants';
import { cacheNotes } from '@/lib/server/server-notes';
import fs from 'fs';
import { difference } from 'lodash';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const log = logger.child({
  module: 'api',
  route: '/api/sync/rebuild',
});
const redis = await createRedisClient();

const traverseDirectory = (dirPath: string, filePaths: string[]) => {
  try {
    const items = fs.readdirSync(dirPath);
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverseDirectory(fullPath, filePaths);
      } else {
        filePaths.push(fullPath);
      }
    });
  } catch (e) {
    log.error('Failed to traverse assets directory', e);
  }
};

interface RebuildReqBody {
  files: {
    path: string;
    md5: string;
    extension: string;
    lastModified: string;
  }[];
  clearOthers: boolean;
}

export async function POST(req: NextRequest) {
  const body: RebuildReqBody = await req.json();
  const { files, clearOthers } = body;

  if (!files || files.length === 0) {
    return NextResponse.json({ msg: 'No files changed' });
  }

  const pathsInVault = files.map(file => file.path);
  const filenames = files.map(file => `${file.md5}.${file.extension}`);

  if (clearOthers) {
    log.info('Rebuilding entire vault...');

    log.info('Validating paths cache...');
    const pathsInCache = await redis.sMembers(RK.PATHS);
    const pathsOnlyInCache = difference(pathsInCache, pathsInVault);
    const pathsOnlyInVault = difference(pathsInVault, pathsInCache);
    log.info(
      {
        pathsInCache,
        pathsInVault,
        pathsOnlyInCache,
        pathsOnlyInVault,
      },
      'Path differences',
    );
    if (pathsOnlyInCache.length > 0) {
      log.info('Remove paths only in cache');
      await redis.sRem(RK.PATHS, pathsOnlyInCache);
    }
    if (pathsOnlyInVault.length > 0) {
      log.info('Add paths only in vault');
      await redis.sAdd(RK.PATHS, pathsOnlyInVault);
    }

    log.info('Validating files cache...');
    const fileKeysInCache = await redis.hKeys(RK.FILES);
    const fileKeysOnlyInCache = difference(fileKeysInCache, pathsInVault);
    const fileKeysOnlyInVault = difference(pathsInVault, fileKeysInCache);
    log.info(
      {
        fileKeysInCache,
        fileKeysOnlyInCache,
        fileKeysOnlyInVault,
      },
      'File cache differences',
    );
    if (fileKeysOnlyInCache.length > 0) {
      log.info('Remove file caches only in cache');
      for (const key of fileKeysOnlyInCache) {
        await redis.hDel(RK.FILES, key);
      }
    }

    if (fileKeysOnlyInVault.length > 0) {
      log.info('Add file caches only in vault');
      for (const key of fileKeysOnlyInVault) {
        const file = files.find(f => f.path === key);
        await redis.hSet(
          RK.FILES,
          key,
          JSON.stringify({
            md5: file?.md5,
            extension: file?.extension,
            diskPath: path.join(
              ASSETS_FOLDER,
              `${file?.md5}.${file?.extension}`,
            ),
            lastModified: file?.lastModified,
          }),
        );
      }
    }

    log.info('Try to delete useless files on disk...');
    const filesOnDisk = fs.readdirSync(ASSETS_FOLDER);
    for (const fileOnDisk of filesOnDisk) {
      if (!filenames.includes(fileOnDisk)) {
        const fullPath = path.join(ASSETS_FOLDER, fileOnDisk);
        fs.unlinkSync(fullPath);
        log.info(`File ${fullPath} is deleted`);
      }
    }

    log.info('Parsing notes...');
    await cacheNotes(files);

    log.info('Rebuilding tree view...');
    const treeView = getNoteTreeView(
      files.map(file => ({
        path: file.path,
        ext: file.extension,
        lastModified: undefined,
      })),
    );
    await redis.json.set(RK.TREE_VIEW, '$', treeView as any);

    log.info('Rebuilding finished');
  } else {
    log.info('Rebuilding specific files...');
    await cacheNotes(files);
    log.info('Rebuilding tree view...');
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
    log.info('Rebuilding finished');
  }

  log.info('Reset home page');
  await resetHome();

  for (const vaultPath of pathsInVault) {
    const notePath = `/notes/${getRoutePathFromVaultPath(vaultPath)}`;
    log.info(`Revalidate path: ${notePath}`);
    revalidatePath(notePath);
  }

  log.info('Revalidate path: /');
  revalidatePath('/');

  return Response.json({
    msg: 'Your notes rebuild successfully',
  });
}

const resetHome = async () => {
  const paths = await redis.sMembers(RK.PATHS);

  for (const path of paths) {
    let result = null;
    try {
      result = await redis.json.get(`${RK.FRONT_MATTER}${path}`, {
        path: ['.home'],
      });
    } catch (e) {
      // do nothing
    }
    if (result === true) {
      await redis.set(RK.HOME, path);
      return;
    }
  }

  await redis.set(RK.HOME, '');
};
