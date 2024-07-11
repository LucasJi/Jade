import { getPostGraphFromPosts } from '@/utils/getPostGraphFromPosts';
import { getPosts } from '@/utils/getPosts';
import GraphView from '@/components/GraphView';

const isGithubConfigured = () => {
  return (
    process.env.GITHUB_REPO_ACCESS_TOKEN &&
    process.env.GITHUB_REPO &&
    process.env.GITHUB_OWNER &&
    process.env.GITHUB_BRANCH
  );
};

export default async function Home() {
  if (!isGithubConfigured()) {
    throw new Error('Github repo not configured');
  }

  const posts = await getPosts();
  const postGraph = await getPostGraphFromPosts(posts);

  return (
    <div className="flex w-full justify-center">
      <GraphView postGraph={postGraph} className="mt-8" />
    </div>
  );
}
