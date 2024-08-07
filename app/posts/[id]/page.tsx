import Markdown from '@/components/markdown';
import Toc from '@/components/toc';
import { notFound } from 'next/navigation';
import { getPostById, getPostIds } from '@/lib/server-utils';

export async function generateStaticParams() {
  try {
    return (await getPostIds()).map(id => encodeURIComponent(id));
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
    // const adjPosts = await getAdjacencyPostsById(post!.id);
    // const postGraph = await getPostGraphFromPosts(adjPosts);

    if (!post) {
      return <div>Post not found</div>;
    }

    return (
      <div className="flex h-full">
        <div className="w-2/3 px-4 min-h-[600px]">
          <Markdown post={post} className="max-h-[620px]" />
        </div>
        <div className="w-1/3 px-4 flex flex-col min-w-[332px] overflow-y-auto">
          {/*<GraphView postGraph={postGraph} postId={decodedId} />*/}
          <Toc content={post?.content} className="mt-4" />
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
