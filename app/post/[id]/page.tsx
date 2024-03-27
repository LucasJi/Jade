import Markdown from '@components/Markdown';

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const decodedId = decodeURIComponent(id);

  const postResp = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/post/${decodedId}`,
    {
      method: 'GET',
    },
  );

  const post = await postResp.json();

  const { content } = post;

  return <Markdown markdown={content} className="max-w-none w-full" />;
}
