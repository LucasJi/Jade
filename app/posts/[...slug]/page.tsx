import Markdown from '@components/Markdown';
import { Slug } from '@types';
import { getSlugs } from '@utils/postUtil';

export default async function Post({
  params: { slug },
}: {
  params: { slug: Slug };
}) {
  const postResp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/post`, {
    method: 'POST',
    body: JSON.stringify({ slug }),
  });

  const post = await postResp.json();

  if (!post) {
    return <div>POST NOT FOUND</div>;
  }

  const { content } = post;

  return <Markdown markdown={content} className="w-full max-w-[1024px]" />;
}

export async function generateStaticParams() {
  return getSlugs();
}
