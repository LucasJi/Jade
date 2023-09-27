'use client';

import Wikilink from '@components/Wikilink';
import wikilinkPlugin from '@utils/remark-wikilink';
import classNames from 'classnames';
import Link from 'next/link';
import ReactMarkdown, { Components } from 'react-markdown';
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
        <a href={href} {...props} />
      );
    },
    h1: props => {
      if (titleLink) {
        return (
          <h1>
            <Link href={titleLink}>{props.children}</Link>
          </h1>
        );
      }

      return <h1 {...props} />;
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
