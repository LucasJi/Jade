import Markdown from '@/components/markdown';
import Toc from '@/components/toc';
import config from '@/lib/config';
import { logger } from '@/lib/logger';
import {
  decodeNoteName,
  encodeNoteName,
  getEncodedNoteNameFromSlugs,
  getNoteSlugsFromPath,
} from '@/lib/note';
import { parse } from '@/lib/parser';
import { getObject, getS3Client, listNoteObjects } from '@/lib/server/s3';
import { remarkCallout } from '@/plugins/remark-callout';
import remarkHighlight from '@/plugins/remark-highlight';
import { remarkTaskList } from '@/plugins/remark-task-list';
import { remarkWikilink } from '@/plugins/remark-wikilink';
import { join } from 'lodash';
import { notFound } from 'next/navigation';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkBreaks from 'remark-breaks';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

const log = logger.child({ module: 'page:notes/[...slug]' });

const s3Client = getS3Client();

export const dynamicParams = true;

export async function generateStaticParams() {
  const noteObjects = await listNoteObjects(s3Client);
  const staticParams = noteObjects.map(noteObject => ({
    slug: getNoteSlugsFromPath(encodeNoteName(noteObject.name)),
  }));

  log.info(
    {
      paths: staticParams.map(param => join(param.slug, '/')),
      notePageCount: staticParams.length,
    },
    'Generate static params',
  );

  return staticParams;
}

export default async function Page(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const params = await props.params;

  const { slug } = params;
  const decodedSlug = slug.map(s => decodeURIComponent(s));

  try {
    const encodedNoteName = getEncodedNoteNameFromSlugs(decodedSlug);
    const noteName = decodeNoteName(encodedNoteName);

    log.info({ decodedSlug, noteName: noteName }, 'Build note page');

    const note = await getObject(s3Client)(config.s3.bucket, noteName);

    if (!note) {
      notFound();
    }

    const hastTree = parse({
      note,
      rehypePlugins: [rehypeRaw as any, rehypeKatex, rehypeSlug],
      remarkPlugins: [
        remarkGfm,
        remarkBreaks,
        remarkHighlight,
        remarkTaskList,
        remarkFrontmatter,
        remarkCallout,
        remarkMath,
        remarkWikilink,
      ],
      className: 'max-h-[620px] px-4',
    });

    return (
      <div className="flex h-full">
        <div className="min-h-[600px] w-2/3">
          <Markdown hastTree={hastTree} />
        </div>
        <div className="flex w-1/3 min-w-[332px] flex-col overflow-y-auto px-4">
          <Toc content={note} className="mt-4" />
        </div>
      </div>
    );
  } catch (error) {
    log.error({ slug, error }, 'Error occurs when building note page');
    notFound();
  }
}
