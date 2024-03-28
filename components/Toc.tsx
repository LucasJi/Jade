import { tocExtractor } from '@utils/toc-extractor';
import classNames from 'classnames';
import ReactMarkdown from 'react-markdown';

const Toc = ({ post, className }: { post: string; className?: string }) => {
  const remarkPlugins = [tocExtractor];
  return (
    <div className={classNames(className)}>
      <span className="font-bold">Table of Content</span>
      <ReactMarkdown remarkPlugins={remarkPlugins}>{post}</ReactMarkdown>
    </div>
  );
};

export default Toc;
