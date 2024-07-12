import { PostGraph } from '@types';
import ForceDirectedGraph from './ForceDirectedGraph';
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
    <div className={clsx('w-fit h-fit', className)}>
      <span className="font-bold">Graph View</span>
      <div className="relative">
        <ForceDirectedGraph postGraph={postGraph} postId={postId} />
        {/* <GlobalGraphView /> */}
      </div>
    </div>
  );
};

export default GraphView;
