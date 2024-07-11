import { getPostGraphFromPosts } from '@/utils/getPostGraphFromPosts';
import { getPosts } from '@/utils/getPosts';
import GraphView from '@/components/GraphView';

export default async function Home() {
  const posts = await getPosts();
  const postGraph = await getPostGraphFromPosts(posts);

  return (
    <div className="flex w-full justify-center">
      <GraphView postGraph={postGraph} className="mt-8" />
    </div>
  );
}
