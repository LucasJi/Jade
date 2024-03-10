import Markdown from '@components/Markdown';
import { Slug } from '@types';
import { getPostBySlug, getSlugs } from '@utils/postUtil';

export default async function Post({ params }: { params: { slug: Slug } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return <div>POST NOT FOUND</div>;
  }

  const { content } = post;

  return <Markdown markdown={content} className="w-full max-w-[1024px]" />;
}

export async function generateStaticParams() {
  return getSlugs();
}
