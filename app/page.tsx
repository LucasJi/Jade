// import GraphView from '@/components/graph-view';
// import { getPostGraphFromPosts, getPosts } from '@/utils/post-util';
// import { MyCanvas } from '@/components/my-canvas';
import { getGlobalPostGraph } from '@/utils/post-util';
import PixiDemo from '@/components/pixi-demo'; // const isGithubConfigured = () => {

// const isGithubConfigured = () => {
//   return (
//     process.env.GITHUB_REPO_ACCESS_TOKEN &&
//     process.env.GITHUB_REPO &&
//     process.env.GITHUB_OWNER &&
//     process.env.GITHUB_BRANCH
//   );
// };

export default async function Home() {
  // if (!isGithubConfigured()) {
  //   throw new Error('Github repo not configured');
  // }
  //
  const postGraph = await getGlobalPostGraph();

  return (
    <div className="flex w-full items-center flex-col">
      {/*<GraphView postGraph={postGraph} className="mt-8" />*/}
      {/*<MyCanvas postGraph={postGraph} />*/}
      <PixiDemo postGraph={postGraph} />
    </div>
  );
}
