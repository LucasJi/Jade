import Markdown from '@components/Markdown';

import { getPostById } from '@utils/postUtil';
export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const decodedId = decodeURIComponent(id);
  const post = getPostById(decodedId);

  if (!post) {
    return <div>Post not found</div>;
  }

  const { content, title } = post;

  return (
    <Markdown markdown={content} title={title} className="max-w-none w-full" />
  );
}
