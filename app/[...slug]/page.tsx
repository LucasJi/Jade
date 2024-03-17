import Markdown from '@components/Markdown';
import { Slug } from '@types';

export default async function Page({
  params: { slug },
}: {
  params: { slug: Slug };
}) {
  const postResp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/post`, {
    method: 'POST',
    body: JSON.stringify({ slug }),
  });

  const post = await postResp.json();

  const { content } = post;

  return <Markdown markdown={content} className="max-w-none w-full" />;
}
