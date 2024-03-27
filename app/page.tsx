import ForceDirectedGraph from '@components/ForceDirectedGraph';
import { PostGraph } from '@types';

export default async function Home() {
  const postGraphResp = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/posts/graph`,
    {
      method: 'GET',
    },
  );
  const postGraph: PostGraph = await postGraphResp.json();

  console.log(postGraph);

  return (
    <div className="flex w-full justify-center">
      <ForceDirectedGraph postGraph={postGraph} />
    </div>
  );
}
