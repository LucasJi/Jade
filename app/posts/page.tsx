import GraphView from '@components/GraphView';
import { getPostGraph } from '@utils/postUtil';

export default async function Page() {
  const postGraph = getPostGraph();

  return (
    <div className="flex w-full justify-center">
      <div className="w-2/3">list</div>
      <div className="w-1/3">
        <GraphView postGraph={postGraph} />
      </div>
    </div>
  );
}
