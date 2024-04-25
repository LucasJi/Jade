import GraphView from '@components/GraphView';
import { Link, Spacer } from '@nextui-org/react';
import { generatePostGraphFromPosts, getPosts } from '@utils/postUtil';

export default async function Page() {
  const posts = getPosts();
  const postGraph = generatePostGraphFromPosts(posts);
  posts.sort((a, b) => b.ctime.getTime() - a.ctime.getTime());

  return (
    <div className="flex w-full justify-center">
      <div className="w-2/3">
        {posts.map(post => (
          <div key={post.id} className="flex items-center">
            <div>{post.ctime.toLocaleDateString()}</div>
            <Spacer x={4} />
            <Link
              href={`/posts/${post.id}`}
              color="foreground"
              underline="hover"
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
