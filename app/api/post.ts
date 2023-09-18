// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedPostBySlug } from '@utils/postUtil';
import { Post } from 'types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Post | null>,
) {
  const { slug } = req.body;

  const post = await getCachedPostBySlug(slug);

  res.status(200).json(post);
}
