'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import wikilinkPlugin from '@utils/remark-wikilink';
import Wikilink from '@components/Wikilink';

const Markdown = ({ markdown }: { markdown: string }) => {
  return (
    <article className="prose prose-slate">
      <ReactMarkdown
        components={{
          a: props => {
            const { className, href, children } = props;
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
