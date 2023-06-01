// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedPostBySlug } from '@utils/postUtil';
import { Post } from '@utils/typeUtil';
import { createRedisInstance } from 'redis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Post | null>,
) {
  const { slug } = req.body;

  const post = await getCachedPostBySlug(slug, createRedisInstance());

  res.status(200).json(post);
}
