'use client';

import Wikilink from '@components/Wikilink';
import wikilinkPlugin from '@utils/remark-wikilink';
import classNames from 'classnames';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Markdown = ({
  markdown,
  className,
}: {
  markdown: string;
  className?: string;
}) => {
  return (
    <article className={classNames('prose', 'prose-slate', className)}>
      <ReactMarkdown
        components={{
          a: props => {
            const { className, href, children } = props;
            return className?.includes('wikilink') && href ? (
              <Wikilink wikilink={href}>{children}</Wikilink>
            ) : (
              <a href={href} {...props} />
            );
          },
        }}
        remarkPlugins={[remarkGfm, wikilinkPlugin]}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
};

export default Markdown;
