import { getAdjacencyPostsById } from '@/utils/getAdjacencyPostsById';
import { getPostById } from '@/utils/getPostById';
import { getPostGraphFromPosts } from '@/utils/getPostGraphFromPosts';
import { getPostIds } from '@/utils/getPostIds';
import GraphView from '@components/GraphView';
import Markdown from '@components/Markdown';
import Toc from '@components/Toc';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  try {
    return getPostIds();
  } catch (error) {
    return [];
  }
}

export default async function Page({
  params: { id },
}: {
  params: { id: string };
}) {
  try {
    const decodedId = decodeURIComponent(id);
    const post = await getPostById(decodedId);
    const adjPosts = await getAdjacencyPostsById(post!.id);
    const postGraph = await getPostGraphFromPosts(adjPosts);

    if (!post) {
      return <div>Post not found</div>;
    }

    return (
      <div className="flex w-full h-full">
        <div className="w-2/3 px-4 flex-1 overflow-y-auto min-h-[600px]">
          <Markdown post={post} className="max-w-none w-full" />
        </div>
        <div className="w-1/3 px-4 flex flex-col overflow-y-auto">
          <GraphView postGraph={postGraph} postId={decodedId} />
          <Toc content={post?.content} className="mt-4" />
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
