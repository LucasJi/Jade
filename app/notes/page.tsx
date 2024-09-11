import { RK_IDS } from '@/lib/constants';
import { getRedisClient } from '@/lib/redis-utils';
import Link from 'next/link';

export default async function Page() {
  const redis = getRedisClient();
  const ids = await redis.smembers(RK_IDS);
  return (
    <div className="flex w-full justify-center">
      <div className="flex w-2/3 flex-col items-center">
        {ids.map(id => (
          <div key={id} className="flex items-center">
            <Link
              href={`/notes/${id}`}
              color="foreground"
              className="text-lg hover:underline"
            >
              {id}
            </Link>
          </div>
        ))}
      </div>
      <div className="w-1/3">TODO: Graph View</div>
    </div>
  );
}
