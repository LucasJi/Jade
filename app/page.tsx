'use client';
// import GraphView from '@/components/graph-view';
// import { getPostGraphFromPosts, getPosts } from '@/lib/server-utils';
// import { MyCanvas } from '@/components/my-canvas';
// const isGithubConfigured = () => {
// const isGithubConfigured = () => {
import dynamic from 'next/dynamic';

// const isGithubConfigured = () => {
//   return (
//     process.env.GITHUB_REPO_ACCESS_TOKEN &&
//     process.env.GITHUB_REPO &&
//     process.env.GITHUB_OWNER &&
//     process.env.GITHUB_BRANCH
//   );
// };

const ClientComponent = dynamic(
  () => import('../components/sigma/root').then(mod => mod.default),
  { ssr: false },
);

export default function Home() {
  // if (!isGithubConfigured()) {
  //   throw new Error('Github repo not configured');
  // }
  //
  // const postGraph = await getGlobalPostGraph();

  return (
    <div className="flex w-full items-center flex-col">
      {/*<GraphView postGraph={postGraph} className="mt-8" />*/}
      {/*<MyCanvas postGraph={postGraph} />*/}
      {/* <PixiDemo postGraph={postGraph} /> */}
      <ClientComponent />
    </div>
  );
}
