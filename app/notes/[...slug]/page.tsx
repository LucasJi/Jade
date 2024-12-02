import Markdown from '@/components/markdown';
import Toc from '@/components/toc';
import TreeView from '@/components/tree-view';
import { logger } from '@/lib/logger';
import {
  decodeNoteName,
  decodeURISlug,
  encodeNoteName,
  getEncodedNoteNameFromSlug,
  getNoteSlugsFromPath,
} from '@/lib/note';
import { createRedisClient } from '@/lib/redis';
import { S3 } from '@/lib/server/s3';
import { getFilenameWithoutExt } from '@/lib/utils';
import { parseNote } from '@/processor/parser';
import { notFound } from 'next/navigation';

const log = logger.child({ module: 'page:notes/[...slug]' });

const s3 = new S3();
const redis = await createRedisClient();
const noteObjectNames = JSON.parse(
  (await redis.get('jade:obj:names')) ?? '[]',
) as string[];

export const dynamicParams = true;

export async function generateStaticParams() {
  return noteObjectNames
    .filter(name => name.includes('.md'))
    .map(name => ({
      slug: getNoteSlugsFromPath(encodeNoteName(name)),
    }));
}

export default async function Page(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;

  const { slug: uriSlug } = params;
  const slug = decodeURISlug(uriSlug);

  try {
    const encodedNoteName = getEncodedNoteNameFromSlug(slug);
    const noteName = decodeNoteName(encodedNoteName);

    // log.info({ slug, noteName: noteName }, 'Build note page');

    const note = await s3.getObject(noteName);

    if (!note) {
      notFound();
    }

    const { hast, headings } = parseNote({
      note,
      plainNoteName: getFilenameWithoutExt(noteName),
    });

    return (
      <div className="flex h-full w-full justify-center">
        <TreeView className="fixed left-4 top-0" />
        <Markdown
          hast={hast}
          origin={noteName}
          className="w-[768px] px-4"
          noteNames={noteObjectNames}
        />
        <Toc headings={headings} className="fixed right-4 top-0" />
      </div>
    );
  } catch (error) {
    // log.error({ slug, error }, 'Error occurs when building note page');
    notFound();
  }
}
