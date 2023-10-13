import Markdown from '@components/Markdown';
import { Slug } from '@types';
import {
  generatePostGraphFromPosts,
  getAdjacencyPosts,
  getCachedSlugs,
  getPostBySlug,
} from '@utils/postUtil';
import classNames from 'classnames';

export default async function Post({ params }: { params: { slug: Slug } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return <div>POST NOT FOUND</div>;
  }

  const adjPosts = await getAdjacencyPosts(post);
  const postGraph = generatePostGraphFromPosts(adjPosts);
  const { wikilink, content } = post;

  return (
    <div
      className={classNames(
        'flex',
        'overflow-y-auto',
        'h-full',
        'w-full',
        'max-w-[1024px]',
      )}
      key={`content-${wikilink}`}
    >
      <Markdown markdown={content} className="w-full max-w-[1024px]" />
    </div>
  );
}

export async function generateStaticParams() {
  return await getCachedSlugs(false);
}
