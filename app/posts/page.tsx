import Link from 'next/link';
import { IDS } from '@/lib/constants';
import { getRedisClient } from '@/lib/redis-utils';

export default async function Page() {
  const redis = getRedisClient();
  const ids = await redis.smembers(IDS);
  console.log('page: /posts');
  return (
    <div className="flex w-full justify-center">
      <div className="flex w-2/3 flex-col items-center">
        {ids.map(id => (
          <div key={id} className="flex items-center">
            <Link
              href={`/posts/${id}`}
              color="foreground"
              className="text-lg hover:underline"
            >
              {id}
            </Link>
          </div>
        ))}
      </div>
      <div className="w-1/3">{/*<GraphView postGraph={postGraph} />*/}</div>
    </div>
  );
}
