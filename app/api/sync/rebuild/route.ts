import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';
import { ASSETS_FOLDER } from '@/lib/server/server-constants';
import fs from 'fs';
import { trimStart } from 'lodash';
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
  }[];
  clearOthers: boolean;
}

export async function POST(req: NextRequest) {
  const body: RebuildBody = await req.json();
  const { files, clearOthers } = body;
  // Cache all files
  log.info('Caching all files...');
  const filePaths: string[] = [];
  traverseDirectory(ASSETS_FOLDER, filePaths);
  const relativeFilePaths = filePaths.map(fp => trimStart(fp, ASSETS_FOLDER));
  await redis.sAdd(RK.PATHS, relativeFilePaths);
  log.info(
    {
      paths: relativeFilePaths,
    },
    'File paths are cached.',
  );

  return Response.json({
    msg: 'Jade notes initialized successfully',
  });
}
