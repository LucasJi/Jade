import Markdown from '@components/Markdown';

export default async function Page({
  params: { wikilink },
}: {
  params: { wikilink: string };
}) {
  const postResp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/post`, {
    method: 'POST',
    body: JSON.stringify({ wikilink: decodeURIComponent(wikilink) }),
  });

  const post = await postResp.json();

  const { content } = post;

  return <Markdown markdown={content} className="max-w-none w-full" />;
}
