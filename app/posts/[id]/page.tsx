import Markdown from '@/components/markdown';
import Toc from '@/components/toc';
import { IDS, POST_ID } from '@/lib/constants';
import { getRedisClient } from '@/lib/redis-utils';
import { Post } from '@types';
import { notFound } from 'next/navigation';

const redis = getRedisClient();

export async function generateStaticParams() {
  const ids = await redis.smembers(IDS);
  return ids.map(id => ({ id }));
}

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  try {
    console.log('page: /posts/[id]', id);
    const postStr = await redis.get(`${POST_ID}${id}`);
    const post = postStr ? (JSON.parse(postStr) as Post) : undefined;

    if (!post) {
      console.log(`post with id ${id} not found`);
      return <div>Post not found</div>;
    }

    return (
      <div className="flex h-full">
        <div className="min-h-[600px] w-2/3">
          <Markdown post={post} className="max-h-[620px] px-4" />
        </div>
        <div className="flex w-1/3 min-w-[332px] flex-col overflow-y-auto px-4">
          <Toc content={post?.content} className="mt-4" />
        </div>
      </div>
    );
  } catch (error) {
    console.error('error occurs when building post page with id', id, error);
    notFound();
  }
}
