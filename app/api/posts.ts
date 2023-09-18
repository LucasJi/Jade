import { getCachedPosts } from '@utils/postUtil';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const posts = await getCachedPosts();

  res.status(200).json(posts);
}
