import { RK } from '@/lib/constants';
import { getRoutePathFromVaultPath } from '@/lib/note';
import { createRedisClient } from '@/lib/redis';
import type { MetadataRoute } from 'next';

export const revalidate = 3600; // revalidate at most every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const result = [
    {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}`,
      lastModified: new Date(),
    },
  ];
  try {
    const redis = await createRedisClient();
    const kvs = await redis.hGetAll(RK.FILES);
    const notePages = Object.keys(kvs).map(key => {
      const fileStr = kvs[key];
      const file = JSON.parse(fileStr);
      return {
        url: `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/notes/${getRoutePathFromVaultPath(key)}`,
        lastModified: file.lastModified,
      };
    });
    result.push(...notePages);
    return result;
  } catch (e) {
    return result;
  }
}
