import EmbedFile from '@/components/embed-file';
import Markdown from '@/components/markdown';
import { RK } from '@/lib/constants';
import { getExt } from '@/lib/file';
import { logger } from '@/lib/logger';
import {
  decodeNotePath,
  decodeURISlug,
  encodeNotePath,
  getEncodedNotePathFromSlug,
  getNoteSlugsFromPath,
} from '@/lib/note';
import { createRedisClient } from '@/lib/redis';
import { Nodes } from 'hast';
import { notFound } from 'next/navigation';

const redis = await createRedisClient();

export const dynamicParams = false;
export const dynamic = 'force-static';

const log = logger.child({
  module: 'app/notes/[...slug]',
});

export async function generateStaticParams() {
  const objPaths = await redis.sMembers(RK.PATHS);
  return objPaths.map(path => ({
    slug: getNoteSlugsFromPath(encodeNotePath(path)),
  }));
}

export default async function Page(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;

  const { slug: uriSlug } = params;
  const slug = decodeURISlug(uriSlug);

  try {
    const encodedNotePath = getEncodedNotePathFromSlug(slug);
    const notePath = decodeNotePath(encodedNotePath);
    const ext = getExt(notePath);

    log.info(
      {
        path: notePath,
      },
      `Rendering page...`,
    );

    if (ext !== 'md') {
      return (
        <div className="flex w-full justify-center">
          <EmbedFile path={notePath} />
        </div>
      );
    }

    const hast = (await redis.json.get(
      `${RK.HAST}${notePath}`,
    )) as unknown as Nodes;

    log.info(
      {
        path: notePath,
      },
      'Get hast of page',
    );

    if (!hast) {
      log.info(
        {
          path: notePath,
        },
        'Page hast not found',
      );
      notFound();
    }

    const objPaths = await redis.sMembers(RK.PATHS);

    return (
      <Markdown
        hast={hast}
        origin={notePath}
        className="w-full"
        notePaths={objPaths}
      />
    );
  } catch (error) {
    log.error({ slug }, 'error occurs when rendering page', error);
    notFound();
  }
}
