import { FileType, MIME, RK } from '@/lib/constants';
import { createRedisClient } from '@/lib/redis';
import { ASSETS_FOLDER } from '@/lib/server/server-constants';
import fs, { ReadStream } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

const redis = await createRedisClient();

// https://www.ericburel.tech/blog/nextjs-stream-files
async function* nodeStreamToIterator(stream: ReadStream) {
  for await (const chunk of stream) {
    yield new Uint8Array(chunk);
  }
}

function iteratorToStream(iterator: AsyncIterator<Uint8Array>) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

function streamFile(path: string): ReadableStream {
  const nodeStream = fs.createReadStream(path);
  return iteratorToStream(nodeStreamToIterator(nodeStream));
}

// read file from disk
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json(
      { msg: `File with name ${name} not found` },
      { status: 404 },
    );
  }

  const fileKeys = await redis.hKeys(RK.FILES);
  const found = fileKeys.find(key => key.includes(name));

  if (!found) {
    return NextResponse.json(
      { msg: `File with name ${name} not found` },
      { status: 404 },
    );
  }

  const fileStat = await redis.hGet(RK.FILES, found);

  if (!fileStat) {
    return NextResponse.json(
      { msg: `File with name ${name} not found in cache` },
      { status: 500 },
    );
  }

  const { md5, extension } = JSON.parse(fileStat);

  return new NextResponse(
    streamFile(path.join(ASSETS_FOLDER, `${md5}.${extension}`)),
    {
      headers: {
        'Content-Type': MIME[extension as FileType],
      },
    },
  );
}
