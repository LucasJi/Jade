import { getCachedPosts } from '@utils/postUtil';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const slugs = await getCachedPosts();

  res.status(200).json(slugs);
}
