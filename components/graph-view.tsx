import { NoteGraph } from '@types';
import clsx from 'clsx';
import ForceDirectedGraph from './force-directed-graph';

const GraphView = ({
  postId,
  postGraph,
  className,
}: {
  postId?: string;
  postGraph: NoteGraph;
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
