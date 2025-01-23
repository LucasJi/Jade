import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';
import { ASSETS_FOLDER } from '@/lib/server/server-constants';
import { noteParser } from '@/processor/parser';
import { NoteParserResult } from '@/processor/types';
import fs from 'fs';
import path from 'path';

const log = logger.child({ module: 'lib/server/server-notes' });
const redis = await createRedisClient();

export const cacheNotes = async (
  files: {
    path: string;
    md5: string;
    extension: string;
  }[],
) => {
  const noteParserResults = new Map<string, NoteParserResult>();

  for (const file of files) {
    const { extension, md5, path: vaultPath } = file;
    if (extension !== 'md') {
      continue;
    }

    const diskPath = path.join(ASSETS_FOLDER, `${md5}.${extension}`);

    const note = fs.readFileSync(diskPath, { encoding: 'utf-8' });
    const noteParserResult = noteParser({
      note,
      plainNoteName: vaultPath,
    });

    const { hast, headings, frontmatter } = noteParserResult;
    noteParserResults.set(vaultPath, noteParserResult);

    await redis.json.set(`${RK.HAST}${vaultPath}`, '$', hast as any);
    await redis.set(`${RK.HEADING}${vaultPath}`, JSON.stringify(headings));
    await redis.json.set(`${RK.FRONT_MATTER}${vaultPath}`, '$', frontmatter);

    if (frontmatter.home === true) {
      await redis.set(RK.HOME, vaultPath);
    }

    if (hast.children && hast.children.length > 0) {
      for (let i = 0; i < hast.children.length; i++) {
        await redis.json.set(
          `${RK.HAST_CHILD}${vaultPath}:${i}`,
          '$',
          hast.children[i] as any,
        );
      }
    }
    log.info(`Note ${vaultPath} is cached`);
  }

  return noteParserResults;
};
