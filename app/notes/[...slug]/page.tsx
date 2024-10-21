import Markdown from '@/components/markdown';
import Toc from '@/components/toc';
import config from '@/lib/config';
import { logger } from '@/lib/logger';
import {
  decodeNoteName,
  getEncodedNoteNameFromSlugs,
  getNotePath,
  getNoteSlugsFromPath,
  listNoteObjects,
} from '@/lib/note';
import { getObject, getS3Client } from '@/lib/s3';
import { notFound } from 'next/navigation';

const log = logger.child({ module: 'page:notes/[...slug]' });
const s3Client = getS3Client();

export const dynamicParams = true;

export async function generateStaticParams() {
  const noteObjects = await listNoteObjects(s3Client);
  const staticParams = noteObjects.map(noteObject => ({
    slug: getNoteSlugsFromPath(getNotePath(noteObject.name)),
  }));
  log.info(
    { paths: staticParams, notePageCount: staticParams.length },
    'Generate static params',
  );
  return staticParams;
}

export default async function Page({
  params: { slug },
}: {
  params: { slug: string[] };
}) {
  try {
    const encodedNoteName = getEncodedNoteNameFromSlugs(slug);
    const noteName = decodeURIComponent(decodeNoteName(encodedNoteName));

    log.info({ slug, noteName }, 'Build note page');

    const note = await getObject(s3Client)(config.s3.bucket, noteName);

    if (!note) {
      return <div>Note not found</div>;
    }

    return (
      <div className="flex h-full">
        <div className="min-h-[600px] w-2/3">
          <Markdown note={note} className="max-h-[620px] px-4" />
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
