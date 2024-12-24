import EmbedFile from '@/components/embed-file';
import Markdown from '@/components/markdown';
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
import { ListItem } from 'mdast';
import { notFound } from 'next/navigation';

const log = logger.child({ module: 'page:notes/[...slug]' });

const redis = await createRedisClient();
const objPaths = await redis.sMembers('jade:obj:paths');

export const dynamicParams = true;

export async function generateStaticParams() {
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

    // 附件
    if (ext !== 'md') {
      return (
        <div className="flex w-full justify-center">
          <EmbedFile path={notePath} />
        </div>
      );
    }

    const headingsStr = (await redis.get(`jade:headings:${notePath}`)) || '';
    const headings = JSON.parse(headingsStr) as ListItem[];

    const hast = (await redis.json.get(
      `jade:hast:${notePath}`,
    )) as unknown as Nodes;

    if (!hast) {
      notFound();
    }

    return (
      <Markdown
        hast={hast}
        origin={notePath}
        className="w-full"
        noteNames={objPaths}
      />
    );
  } catch (error) {
    // log.error({ slug, error }, 'Error occurs when building note page');
    notFound();
  }
}
