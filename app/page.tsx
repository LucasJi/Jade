import ForceDirectedGraph from '@components/ForceDirectedGraph';
import { PostGraph } from '@types';

export default async function Home() {
  const postGraph: PostGraph = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/graph`,
    {
      method: 'GET',
      cache: 'no-store',
    },
  ).then(resp => resp.json());

  return (
    <div className="flex w-full justify-center">
      <ForceDirectedGraph postGraph={postGraph} />
    </div>
  );
}
