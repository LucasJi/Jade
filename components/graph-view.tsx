import { PostGraph } from '@types';
import ForceDirectedGraph from './force-directed-graph';
import clsx from 'clsx';

const GraphView = ({
  postId,
  postGraph,
  className,
}: {
  postId?: string;
  postGraph: PostGraph;
  className?: string;
}) => {
  return (
    <div className={clsx(className)}>
      <span className="font-bold">Graph View</span>
      <div className="relative">
        <ForceDirectedGraph postGraph={postGraph} postId={postId} size={600} />
        {/* <GlobalGraphView /> */}
      </div>
    </div>
  );
};

export default GraphView;
