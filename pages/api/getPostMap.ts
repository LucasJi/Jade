// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedPostMap } from '@utils/postUtil';
import { PostMap } from 'types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostMap>,
) {
  const post = await getCachedPostMap();

  res.status(200).json(post);
}
