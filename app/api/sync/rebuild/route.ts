import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { getNoteTreeView } from '@/lib/note';
import { createRedisClient } from '@/lib/redis';
import { ASSETS_FOLDER } from '@/lib/server/server-constants';
import { cacheNotes } from '@/lib/server/server-notes';
import fs from 'fs';
import { difference, startsWith } from 'lodash';
import { NextRequest } from 'next/server';
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

interface RebuildBody {
  files: {
    path: string;
    md5: string;
    extension: string;
    lastModified: string;
  }[];
  clearOthers: boolean;
}

export async function POST(req: NextRequest) {
  const body: RebuildBody = await req.json();
  const { files, clearOthers } = body;
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
    log.info('Clear all note caches');
    const keys = await redis.keys(RK.ALL);
    for (const key of keys) {
      if (
        startsWith(key, RK.HAST) ||
        startsWith(key, RK.HEADING) ||
        startsWith(key, RK.FRONT_MATTER) ||
        startsWith(key, RK.HAST_CHILD)
      ) {
        await redis.del(key);
      }
    }

    const noteParserResults = await cacheNotes(files);
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
    const treeView = getNoteTreeView(
      files.map(file => ({
        path: file.path,
        ext: file.extension,
        lastModified: undefined,
      })),
    );
    await redis.json.set(RK.TREE_VIEW, '$', treeView as any);
    log.info('Rebuilding finished');
  }

  return Response.json({
    msg: 'Your notes rebuild successfully',
  });
}
