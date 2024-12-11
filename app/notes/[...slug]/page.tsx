import Markdown from '@/components/markdown';
import { logger } from '@/lib/logger';
import {
  decodeNotePath,
  decodeURISlug,
  encodeNotePath,
  getEncodedNotePathFromSlug,
  getNoteSlugsFromPath,
} from '@/lib/note';
import { createRedisClient } from '@/lib/redis';
import { S3 } from '@/lib/server/s3';
import { Nodes } from 'hast';
import { ListItem } from 'mdast';
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
      slug: getNoteSlugsFromPath(encodeNotePath(name)),
    }));
}

export default async function Page(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;

  const { slug: uriSlug } = params;
  const slug = decodeURISlug(uriSlug);

  try {
    const encodedNoteName = getEncodedNotePathFromSlug(slug);
    const noteName = decodeNotePath(encodedNoteName);

    const headingsStr = (await redis.get(`jade:headings:${noteName}`)) || '';
    const headings = JSON.parse(headingsStr) as ListItem[];

    const hast = (await redis.json.get(
      `jade:hast:${noteName}`,
    )) as unknown as Nodes;

    if (!hast) {
      notFound();
    }

    return (
      <Markdown
        hast={hast}
        origin={noteName}
        className="w-[768px] px-4"
        noteNames={noteObjectNames}
      />
    );
  } catch (error) {
    // log.error({ slug, error }, 'Error occurs when building note page');
    notFound();
  }
}
