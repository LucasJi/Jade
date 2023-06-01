// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getPostBySlug, getWikilinkFromSlug } from '@utils/postUtil';
import { Post } from '@utils/typeUtil';
import { createRedisInstance } from 'redis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Post | null>,
) {
  if (req.method !== 'POST') {
    res.status(405);
    res.statusMessage = 'only supports POST method';
    return;
  }

  const { slug } = req.body;

  const wikilink = getWikilinkFromSlug(slug);
  const redis = createRedisInstance();
  let post = null;
  const postJson = await redis.get(wikilink);
  if (postJson !== null) {
    console.log('read post from redis');
    post = JSON.parse(postJson);
  } else {
    console.log('read post from file');
    post = getPostBySlug(slug);
  }

  res.status(200).json(post);
}
