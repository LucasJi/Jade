'use client';

import Wikilink from '@components/Wikilink';
import { Code, Link } from '@nextui-org/react';
import wikilinkPlugin from '@utils/remark-wikilink';
import classNames from 'classnames';
import { Element, Text } from 'hast';
// import Link from 'next/link';
import ReactMarkdown, { Components } from 'react-markdown';
// highlight.js doesn't support React.JSX syntax
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';

const components = (titleLink?: string): Components => ({
  a: props => {
    const { className, href, children } = props;
    return className?.includes('wikilink') && href ? (
      <Wikilink wikilink={href}>{children}</Wikilink>
    ) : (
      <Link
        isExternal
        href={href}
        showAnchorIcon
        color="foreground"
        className="underline-l-r"
      >
        {children}
      </Link>
    );
  },
  h1: props => {
    if (titleLink) {
      return (
        <h1>
          <Link className="underline-l-r" href={titleLink} color="foreground">
            {props.children}
          </Link>
        </h1>
      );
    }

    return <h1>{props.children}</h1>;
  },
  pre: props => {
    const { children, className, node } = props;

    const code = node.children.find(
      child => (child as Element).tagName === 'code',
    ) as Element | undefined;

    if (!code) {
      return <pre className={className}>{children}</pre>;
    }

    const codeClassName = code.properties?.className as string[];
    const language = codeClassName.flatMap(cls => {
      const match = /language-(\w+)/.exec(cls);
      return match ? [match[1]] : [];
    })[0];

    return language ? (
      <SyntaxHighlighter style={oneDark} language={language} showLineNumbers>
        {(code.children[0] as Text).value.replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <pre className={classNames(className)}>{children}</pre>
    );
  },
  code: props => {
    return <Code className="not-prose">{props.children}</Code>;
  },
});

const Markdown = ({
  markdown,
  className,
  titleLink,
}: {
  markdown: string;
  className?: string;
  titleLink?: string;
}) => {
  return (
    <article className={classNames('prose', 'prose-neutral', className)}>
      <ReactMarkdown
        components={components(titleLink)}
        remarkPlugins={[remarkGfm, wikilinkPlugin, remarkFrontmatter]}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
};

export default Markdown;
