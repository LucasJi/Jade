import { FileType, RK } from '@/lib/constants';
import { getExt, getFilename } from '@/lib/file';
import { logger } from '@/lib/logger';
import { getNoteTreeView, getRoutePathFromVaultPath } from '@/lib/note';
import { createRedisClient } from '@/lib/redis';
import { ASSETS_FOLDER } from '@/lib/server/server-constants';
import { noteParser } from '@/processor/parser';
import { readFile } from 'fs/promises';
import { toText } from 'hast-util-to-text';
import { revalidatePath } from 'next/cache';
import path from 'path';

const log = logger.child({ module: 'lib/server/server-notes' });
const redis = await createRedisClient();

export const buildNoteCaches = (
  files: {
    path: string;
    md5: string;
    extension: string;
    isDeleted?: boolean;
  }[],
) => {
  for (const file of files) {
    const { extension, md5, path: vaultPath, isDeleted } = file;

    if (isDeleted) {
      const ext = getExt(vaultPath);

      if (ext === FileType.MD) {
        redis.get(RK.HOME).then(home => {
          if (home === vaultPath) {
            redis
              .set(RK.HOME, '')
              .then(() => log.debug(`Home page ${vaultPath} is deleted`));
          }
        });
        redis.json.del(`${RK.HAST}${vaultPath}`).then(() => {
          log.debug(`Hast of ${vaultPath} is deleted`);
          const notePath = `/notes/${getRoutePathFromVaultPath(vaultPath)}`;
          log.info(`Revalidate path: ${notePath}`);
          revalidatePath(notePath);
        });
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

    if (extension !== 'md') {
      continue;
    }

    log.debug(`Caching note ${vaultPath}`);
    const diskPath = path.join(ASSETS_FOLDER, `${md5}.${extension}`);

    readFile(diskPath, { encoding: 'utf-8' }).then(note => {
      const noteParserResult = noteParser({
        note,
        plainNoteName: getFilename(vaultPath),
      });
      log.debug('Parse note');

      const { hast, headings, frontmatter } = noteParserResult;

      if (frontmatter.home) {
        redis
          .set(RK.HOME, vaultPath)
          .then(() => {
            log.debug(`Set ${vaultPath} as home page`);
            log.info('Revalidate path: /');
            revalidatePath('/');
          })
          .catch(e => log.error(e));
      }

      redis.json.set(`${RK.HAST}${vaultPath}`, '$', hast as any).then(() => {
        log.debug(`Set hast of ${vaultPath}`);
        const notePath = `/notes/${getRoutePathFromVaultPath(vaultPath)}`;
        log.info(`Revalidate path: ${notePath}`);
        revalidatePath(notePath);
      });

      redis
        .set(`${RK.HEADING}${vaultPath}`, JSON.stringify(headings))
        .then(() => log.debug(`Set heading of ${vaultPath}`));
      redis.json
        .set(`${RK.FRONT_MATTER}${vaultPath}`, '$', frontmatter)
        .then(() => log.debug(`Set frontmatter of ${vaultPath}`));

      log.debug('Update redis');

      if (hast.children && hast.children.length > 0) {
        for (let i = 0; i < hast.children.length; i++) {
          const text = toText(hast.children[i]);
          if (text !== '') {
            redis.json
              .set(`${RK.HAST_CHILD}${vaultPath}:${i}`, '$', {
                type: 'text',
                value: text,
              })
              .then(() => log.debug(`Set hast child ${i} of ${vaultPath}`));
          }
        }
      }

      log.info(`${vaultPath} is cached`);
    });
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
