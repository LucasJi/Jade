import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { getRoutePathFromVaultPath } from '@/lib/note';
import { createRedisClient } from '@/lib/redis';
import { cacheNotes, rebuildTreeView } from '@/lib/server/server-notes';
import fs from 'fs';
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
    log.error({ error: e }, 'Failed to traverse assets directory');
  }
};

interface RebuildReqBody {
  files: {
    path: string;
    md5: string;
    extension: string;
    lastModified: string;
  }[];
}

export async function POST(req: NextRequest) {
  const body: RebuildReqBody = await req.json();
  const { files } = body;

  if (!files || files.length === 0) {
    return NextResponse.json({ msg: 'No files changed' });
  }

  log.info('Rebuild begins');

  const pathsInVault = files.map(file => file.path);

  await cacheNotes(files);
  await rebuildTreeView();
  await resetHome();

  for (const vaultPath of pathsInVault) {
    const notePath = `/notes/${getRoutePathFromVaultPath(vaultPath)}`;
    log.info(`Revalidate path: ${notePath}`);
    revalidatePath(notePath);
  }

  log.info('Revalidate path: /');
  revalidatePath('/');

  return Response.json({
    msg: 'Rebuild completed',
  });
}

const resetHome = async () => {
  log.info('Reset home page');
  const paths = await redis.sMembers(RK.PATHS);

  for (const path of paths) {
    let result = null;
    try {
      result = await redis.json.get(`${RK.FRONT_MATTER}${path}`, {
        path: ['.home'],
      });
    } catch (e) {
      log.error(`Failed to get frontmatter: ${e}`);
    }
    if (result === true) {
      await redis.set(RK.HOME, path);
      return;
    }
  }

  await redis.set(RK.HOME, '');
};
