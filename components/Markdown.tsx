'use client';

import { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import wikilinkPlugin from '@utils/remark-wikilink';
import Wikilink from '@components/wikilink';

const wikilinkRender = ({
  className,
  href,
  children,
  ...props
}: {
  className: string | undefined;
  href: string | undefined;
  children: ReactNode;
}) => {
  return className?.includes('wikilink') && href ? (
    <Wikilink
      onClick={() => {
        console.log('on click wikilink');
      }}
      wikilink={href}
    >
      {children}
    </Wikilink>
  ) : (
    <a href={href} {...props} />
  );
};

const Markdown = ({ markdown = '' }: { markdown?: string }) => {
  return (
    <article className="prose prose-slate">
      <ReactMarkdown
        components={{
          // Must to do so to avoid the problem: https://github.com/facebook/react/issues/24519
          // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
          p: ({ node, ...props }) => <div {...props} />,
          a: props => {
            const { className, href, children } = props;
            return wikilinkRender({
              className,
              href,
              children,
            });
          },
          // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
          pre: ({ node, ...props }) => (
            <pre className="overflow-x-auto" {...props} />
          ),
        }}
        remarkPlugins={[remarkGfm, wikilinkPlugin]}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
};

export default Markdown;
