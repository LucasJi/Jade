import type { NextApiRequest, NextApiResponse } from 'next';
import { initPosts } from '@utils/postUtil';

// this api is used to read and store posts in redis
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405);
    res.statusMessage = 'only supports POST method';
    return;
  }

  const posts = await initPosts();

  res.status(200).json(posts);
}
