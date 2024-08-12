import Markdown from '@/components/markdown';
import Toc from '@/components/toc';
import { notFound } from 'next/navigation';
import { IDS, POST_ID } from '@/lib/constants';
import { Post } from '@types';
import { getRedisClient } from '@/lib/redis-utils';

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
        <div className="w-2/3 px-4 min-h-[600px]">
          <Markdown post={post} className="max-h-[620px]" />
        </div>
        <div className="w-1/3 px-4 flex flex-col min-w-[332px] overflow-y-auto">
          <Toc content={post?.content} className="mt-4" />
        </div>
      </div>
    );
  } catch (error) {
    console.error('error occurs when building post page with id', id, error);
    notFound();
  }
}
