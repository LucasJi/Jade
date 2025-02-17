import Markdown from '@/components/markdown';
import { RK } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { createRedisClient } from '@/lib/redis';
import { Nodes } from 'hast';
import { notFound } from 'next/navigation';

const redis = await createRedisClient();

export default async function Home() {
  const home = await redis.get(RK.HOME);

  logger.info(
    {
      home,
    },
    'Building home page...',
  );

  if (!home) {
    notFound();
  }

  const paths = await redis.sMembers(RK.PATHS);
  const hast = (await redis.json.get(`${RK.HAST}${home}`)) as unknown as Nodes;

  return (
    <Markdown hast={hast} origin={home} className="w-full" vaultPaths={paths} />
  );
}
