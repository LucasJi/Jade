'use client';

import Wikilink from '@components/Wikilink';
import wikilinkPlugin from '@utils/remark-wikilink';
import classNames from 'classnames';
import Link from 'next/link';
import ReactMarkdown, { Components } from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import remarkGfm from 'remark-gfm';

const Markdown = ({
  markdown,
  className,
  titleLink,
}: {
  markdown: string;
  className?: string;
  titleLink?: string;
}) => {
  const components: Components = {
    a: props => {
      const { className, href, children } = props;
      return className?.includes('wikilink') && href ? (
        <Wikilink wikilink={href}>{children}</Wikilink>
      ) : (
        <a href={href} {...props} rel="noopener noreferrer" target="_blank" />
      );
    },
    h1: props => {
      if (titleLink) {
        return (
          <h1>
            <Link className="underline-l-r" href={titleLink}>
              {props.children}
            </Link>
          </h1>
        );
      }

      return <h1 {...props} />;
    },
    code: props => {
      const { children, className } = props;
      const match = /language-(\w+)/.exec(className || '');
      return match ? (
        <SyntaxHighlighter style={atomOneDark} language={match[1]}>
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className}>{children}</code>
      );
    },
  };

  return (
    <article className={classNames('prose', 'prose-slate', className)}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm, wikilinkPlugin]}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
};

export default Markdown;
