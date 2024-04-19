import { PostGraph } from '@types';
import classNames from 'classnames';
import ForceDirectedGraph from './ForceDirectedGraph';
import GlobalGraphView from './GlobalGraphView';

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
    <div className={classNames('w-fit h-fit', className)}>
      <span className="font-bold">Graph View</span>
      <div className="relative">
        <ForceDirectedGraph postGraph={postGraph} postId={postId} />
        <GlobalGraphView />
      </div>
    </div>
  );
};

export default GraphView;
