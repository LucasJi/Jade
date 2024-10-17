import Markdown from '@/components/markdown';
import Toc from '@/components/toc';
import { PIC_FORMATS, RK_ID_NOTE, RK_ID_PATH, RK_IDS } from '@/lib/constants';
import { getRedisClient } from '@/lib/redis';
import { Note, NoteObject } from '@types';
import { notFound } from 'next/navigation';

const redis = getRedisClient();

export const dynamicParams = true;

export async function generateStaticParams() {
  const ids = await redis.smembers(RK_IDS);
  return ids.map(id => ({ id }));
}

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  try {
    const pathIteStr = await redis.get(`${RK_ID_PATH}${id}`);

    if (!pathIteStr) {
      return <div>Note not found</div>;
    }

    const pathItem = JSON.parse(pathIteStr) as NoteObject;

    if (PIC_FORMATS.includes(pathItem.ext)) {
      return <span>{`TODO: show image: ${pathItem.name}`}</span>;
    }

    const noteJson = await redis.get(`${RK_ID_NOTE}${id}`);
    const note = noteJson ? (JSON.parse(noteJson) as Note) : undefined;

    if (!note) {
      return <div>Note not found</div>;
    }

    return (
      <div className="flex h-full">
        <div className="min-h-[600px] w-2/3">
          <Markdown note={note} className="max-h-[620px] px-4" />
        </div>
        <div className="flex w-1/3 min-w-[332px] flex-col overflow-y-auto px-4">
          <Toc content={note?.content} className="mt-4" />
        </div>
      </div>
    );
  } catch (error) {
    console.error('error occurs when building note page with id', id, error);
    notFound();
  }
}
