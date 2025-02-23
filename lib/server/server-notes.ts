import { FileType, RK } from '@/lib/constants';
import { getExt, getFilename } from '@/lib/file';
import { logger } from '@/lib/logger';
import { getNoteTreeView, getRoutePathFromVaultPath } from '@/lib/note';
import { createRedisClient } from '@/lib/redis';
import { ASSETS_FOLDER } from '@/lib/server/server-constants';
import { noteParser } from '@/processor/parser';
import fs from 'fs';
import { toText } from 'hast-util-to-text';
import { revalidatePath } from 'next/cache';
import path from 'path';

const log = logger.child({ module: 'lib/server/server-notes' });
const redis = await createRedisClient();

export const buildNoteCaches = async (
  files: {
    path: string;
    md5: string;
    extension: string;
    isDeleted?: boolean;
  }[],
) => {
  const home = await redis.get(RK.HOME);

  for (const file of files) {
    const { extension, md5, path: vaultPath, isDeleted } = file;

    if (isDeleted) {
      const ext = getExt(vaultPath);

      if (ext === FileType.MD) {
        if (home === vaultPath) {
          await redis.set(RK.HOME, '');
          revalidatePath('/');
        }

        await redis.json.del(`${RK.HAST}${vaultPath}`);
        log.debug(`Hast of ${vaultPath} is deleted`);
        const notePath = `/notes/${getRoutePathFromVaultPath(vaultPath)}`;
        log.info(`Revalidate path: ${notePath}`);
        revalidatePath(notePath);

        redis
          .del(`${RK.HEADING}${vaultPath}`)
          .then(() => log.debug(`Headings of ${vaultPath} is deleted`));
        redis.json
          .del(`${RK.FRONT_MATTER}${vaultPath}`)
          .then(() => log.debug(`Frontmatter of ${vaultPath} is deleted`));
      } else {
        const notePath = `/notes/${getRoutePathFromVaultPath(vaultPath)}`;
        log.info(`Revalidate path: ${notePath}`);
        revalidatePath(notePath);
      }

      continue;
    }

    if (extension !== FileType.MD) {
      continue;
    }

    log.debug(`Caching note ${vaultPath}`);
    const diskPath = path.join(ASSETS_FOLDER, `${md5}.${extension}`);
    const note = fs.readFileSync(diskPath, { encoding: 'utf-8' });
    const noteParserResult = noteParser({
      note,
      plainNoteName: getFilename(vaultPath),
    });
    const { hast, headings, frontmatter } = noteParserResult;

    await redis.json.set(`${RK.HAST}${vaultPath}`, '$', hast as any);
    log.debug(`Set hast of ${vaultPath}`);
    const notePath = `/notes/${getRoutePathFromVaultPath(vaultPath)}`;
    log.info(`Revalidate path: ${notePath}`);
    revalidatePath(notePath);

    if (frontmatter.home === true) {
      await redis.set(RK.HOME, vaultPath);
      log.info('Revalidate path: /');
      revalidatePath('/');
    }

    await redis.set(`${RK.HEADING}${vaultPath}`, JSON.stringify(headings));
    await redis.json.set(`${RK.FRONT_MATTER}${vaultPath}`, '$', frontmatter);

    if (hast.children && hast.children.length > 0) {
      for (let i = 0; i < hast.children.length; i++) {
        const text = toText(hast.children[i]);
        if (text !== '') {
          redis.json
            .set(`${RK.HAST_CHILD}${vaultPath}:${i}`, '$', {
              type: 'text',
              value: text,
            })
            .then(r =>
              log.debug(`Set ${RK.HAST_CHILD}${vaultPath}:${i} - ${r}`),
            );
        }
      }
    }
  }
};

export const buildTreeView = async () => {
  return redis.hKeys(RK.FILES).then(allFiles => {
    const treeView = getNoteTreeView(
      allFiles.map(file => {
        return {
          path: file,
          ext: getExt(file),
          lastModified: undefined,
        };
      }),
    );
    return redis.json.set(RK.TREE_VIEW, '$', treeView as any);
  });
};
