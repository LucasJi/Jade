import GraphView from '@components/GraphView';
import Markdown from '@components/Markdown';
import Toc from '@components/Toc';
import {
  generatePostGraphFromPosts,
  getAdjacencyPosts,
  getIds,
  getPostById,
} from '@utils/postUtil';

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  const decodedId = decodeURIComponent(id);

  const post = getPostById(decodedId);
  const adjPosts = getAdjacencyPosts(post!);
  const postGraph = generatePostGraphFromPosts(adjPosts);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="flex w-full h-full">
      <div className="w-2/3 p-4 flex-1 overflow-y-auto min-h-[600px]">
        <Markdown post={post} className="max-w-none w-full" />
      </div>
      <div className="w-1/3 p-4 flex flex-col overflow-y-auto">
        <GraphView postGraph={postGraph} postId={decodedId} />
        <Toc post={post!} className="mt-4" />
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  return getIds();
}
