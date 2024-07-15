import Link from 'next/link';
import GraphView from '@/components/graph-view';
import { getPostGraphFromPosts, getPosts } from '@/utils/post-util';

export default async function Page() {
  const posts = await getPosts();
  const postGraph = await getPostGraphFromPosts(posts);
  posts.sort((a, b) => b.ctime.getTime() - a.ctime.getTime());

  return (
    <div className="flex w-full justify-center">
      <div className="w-2/3 flex flex-col items-center">
        {posts.map(post => (
          <div key={post.id} className="flex items-center">
            <Link
              href={`/posts/${encodeURIComponent(post.id)}`}
              color="foreground"
              className="text-lg hover:underline"
            >
              {post.title}
            </Link>
          </div>
        ))}
      </div>
      <div className="w-1/3">
        <GraphView postGraph={postGraph} />
      </div>
    </div>
  );
}
