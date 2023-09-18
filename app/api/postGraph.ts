// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCachedPostGraph } from '@utils/postUtil';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const postGraph = await getCachedPostGraph();

  res.status(200).json(postGraph);
}
