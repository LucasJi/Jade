// import GraphView from '@/components/graph-view';
// import { getPostGraphFromPosts, getPosts } from '@/lib/server-utils';
// import { MyCanvas } from '@/components/my-canvas';
// const isGithubConfigured = () => {
// const isGithubConfigured = () => {
import { getPostIds } from '@/lib/server-utils';

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
  // const postGraph = await getGlobalPostGraph();

  const ids = await getPostIds();

  return (
    <div className="flex w-full items-center flex-col">
      {/*<GraphView postGraph={postGraph} className="mt-8" />*/}
      {/*<MyCanvas postGraph={postGraph} />*/}
      {/* <PixiDemo postGraph={postGraph} /> */}
      {/*<ClientComponent />*/}
      {ids.map(id => (
        <p>{id}</p>
      ))}
    </div>
  );
}
