import GraphView from '@components/GraphView';
import { getPostGraph } from '@utils/postUtil';

export default async function Home() {
  const postGraph = getPostGraph();

  return (
    <div className="flex w-full justify-center">
      <GraphView postGraph={postGraph} className="mt-8" />
    </div>
  );
}
