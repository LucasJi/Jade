import Markdown from '@/components/markdown';
import Toc from '@/components/toc';
import config from '@/lib/config';
import { logger } from '@/lib/logger';
import {
  decodeNoteName,
  decodeURISlug,
  encodeNoteName,
  getEncodedNoteNameFromSlug,
  getNoteSlugsFromPath,
} from '@/lib/note';
import { createRedisClient } from '@/lib/redis';
import { getObject, getS3Client } from '@/lib/server/s3';
import { getFilenameWithoutExt } from '@/lib/utils';
import { parseNote } from '@/processor/parser';
import { notFound } from 'next/navigation';

const log = logger.child({ module: 'page:notes/[...slug]' });

const s3Client = getS3Client();
const redis = await createRedisClient();
const noteObjectNames = JSON.parse(
  (await redis.get('jade:obj:names')) ?? '[]',
) as string[];

export const dynamicParams = true;

export async function generateStaticParams() {
  // const noteObjectNames = JSON.parse(
  //   (await redis.get('jade:obj:names')) ?? '[]',
  // ) as string[];
  const staticParams = noteObjectNames.map(name => ({
    slug: getNoteSlugsFromPath(encodeNoteName(name)),
  }));

  // log.info(
  //   {
  //     paths: staticParams.map(param => join(param.slug, '/')),
  //     notePageCount: staticParams.length,
  //   },
  //   'Generate static params',
  // );

  return staticParams;
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

    const note = await getObject(s3Client)(config.s3.bucket, noteName);

    if (!note) {
      notFound();
    }

    const { hast, headings } = parseNote({
      note,
      noteFilename: getFilenameWithoutExt(noteName),
    });

    return (
      <div className="flex h-full">
        <div className="min-h-[600px] w-2/3">
          <Markdown
            hast={hast}
            sourceNote={noteName}
            className="max-h-[620px] px-4"
            noteNames={noteObjectNames}
          />
        </div>
        <div className="flex w-1/3 min-w-[332px] flex-col overflow-y-auto px-4">
          <Toc headings={headings} className="mt-4" />
        </div>
      </div>
    );
  } catch (error) {
    // log.error({ slug, error }, 'Error occurs when building note page');
    notFound();
  }
}
