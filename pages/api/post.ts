// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getPostBySlug } from '@utils/postUtil';
import { Post } from '@utils/typeUtil';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Post>,
) {
  if (req.method !== 'POST') {
    res.status(400);
    res.statusMessage = 'only supports POST method';
    return;
  }

  const { slug } = req.body;

  const post = getPostBySlug(slug);

  res.status(200).json(post);
}
