import { getPostGraphFromPosts } from '@/utils/getPostGraphFromPosts';
import { getPosts } from '@/utils/getPosts';
import GraphView from '@/components/GraphView';
import { Link } from '@nextui-org/react';

export default async function Page() {
  const posts = await getPosts();
  const postGraph = await getPostGraphFromPosts(posts);
  posts.sort((a, b) => b.ctime.getTime() - a.ctime.getTime());

  return (
    <div className="flex w-full justify-center">
      <div className="w-2/3 flex flex-col items-center">
        {posts.map(post => (
          <div key={post.id} className="flex items-center">
            {/* <div>{post.ctime.toLocaleDateString()}</div>
            <Spacer x={4} /> */}
            <Link
              href={`/posts/${encodeURIComponent(post.id)}`}
              color="foreground"
              underline="hover"
              className="text-lg"
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
