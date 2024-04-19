import { PostGraph } from '@types';
import ForceDirectedGraph from './ForceDirectedGraph';
import GlobalGraphView from './GlobalGraphView';

const GraphView = ({
  postId,
  postGraph,
}: {
  postId?: string;
  postGraph: PostGraph;
}) => {
  return (
    <div className="w-fit h-fit">
      <span className="font-bold">Graph View</span>
      <div className="relative">
        <ForceDirectedGraph postGraph={postGraph} postId={postId} />
        <GlobalGraphView />
      </div>
    </div>
  );
};

export default GraphView;
