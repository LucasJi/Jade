import Markdown from '@components/Markdown';

export const dynamic = 'force-dynamic';

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const decodedId = decodeURIComponent(id);

  const post = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/post/${decodedId}`,
    {
      method: 'GET',
    },
  ).then(resp => resp.json());

  const { content, title } = post;

  return (
    <Markdown markdown={content} title={title} className="max-w-none w-full" />
  );
}
