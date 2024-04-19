import GraphView from '@components/GraphView';
import { PostGraph } from '@types';

export default async function Home() {
  const postGraph: PostGraph = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/graph`,
    {
      method: 'GET',
    },
  ).then(resp => resp.json());

  return (
    <div className="flex w-full justify-center">
      <GraphView postGraph={postGraph} className="mt-8" />
    </div>
  );
}
