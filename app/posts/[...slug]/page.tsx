import ForceDirectedGraph from '@components/ForceDirectedGraph';
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
        'p-4',
      )}
      key={`content-${wikilink}`}
    >
      <div className="w-[calc((100%_-_1024px)_/_2)]">DIRECTORY</div>
      <Markdown markdown={content} className="max-w-[1024px]" />
      <ForceDirectedGraph
        className="fixed right-0"
        postGraph={postGraph}
        height={400}
        width={400}
        scale={0.6}
      />
    </div>
  );
}

export async function generateStaticParams() {
  return await getCachedSlugs();
}
