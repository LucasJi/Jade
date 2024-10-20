import Markdown from '@/components/markdown';
import Toc from '@/components/toc';
import { logger } from '@/lib/logger';
import { getNoteId, listNoteObjects } from '@/lib/note';
import { getS3Client } from '@/lib/s3';
import { notFound } from 'next/navigation';

const log = logger.child({ module: 'page:notes/[path]' });
const s3Client = getS3Client();

export const dynamicParams = true;

export async function generateStaticParams() {
  const noteObjects = await listNoteObjects(s3Client);
  const staticParams = noteObjects.map(noteObject => ({
    id: getNoteId(noteObject.name),
  }));
  log.info({ paths: staticParams }, 'Generate static params');
  return staticParams;
}

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  try {
    // const note = await getObject(s3Client)(config.s3.bucket, id);
    const note = '';
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
    console.error('error occurs when building note page with id', id, error);
    notFound();
  }
}
