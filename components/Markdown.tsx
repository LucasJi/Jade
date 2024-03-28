import { Code, Link } from '@nextui-org/react';
import { remarkWikilink } from '@utils/remark-wikilink';
import classNames from 'classnames';
import { Element, Text } from 'hast';
// import Link from 'next/link';
import ReactMarkdown, { Components } from 'react-markdown';
import { HeadingProps } from 'react-markdown/lib/ast-to-react';
// highlight.js doesn't support React.JSX syntax
import Slugger from 'github-slugger';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import Wikilink from './Wikilink';

const getHeadingId = (props: HeadingProps) => {
  const slugs = new Slugger();
  const hContent = props.children[0] as string;
  return slugs.slug(hContent);
};

const components = (renderWikilink: boolean): Components => ({
  a: props => {
    const { className, href, children } = props;
    if (className?.includes('wikilink')) {
      return renderWikilink ? (
        <Wikilink wikilink={href}>{children}</Wikilink>
      ) : (
        <span>{children}</span>
      );
    }

    const isFragment = href?.startsWith('#');

    return (
      <Link
        isExternal={!isFragment}
        href={href}
        showAnchorIcon={!isFragment}
        color="foreground"
      >
        {children}
      </Link>
    );
  },
  h2: props => {
    return <h2 id={getHeadingId(props)}>{props.children}</h2>;
  },
  h3: props => {
    return <h3 id={getHeadingId(props)}>{props.children}</h3>;
  },
  h4: props => {
    return <h4 id={getHeadingId(props)}>{props.children}</h4>;
  },
  h5: props => {
    return <h5 id={getHeadingId(props)}>{props.children}</h5>;
  },
  h6: props => {
    return <h6 id={getHeadingId(props)}>{props.children}</h6>;
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
  li: props => <li className="not-prose">{props.children}</li>,
});

const Markdown = ({
  markdown,
  className,
  renderWikilink = true,
}: {
  markdown: string;
  className?: string;
  renderWikilink?: boolean;
}) => {
  const remarkPlugins = [remarkGfm, remarkFrontmatter, remarkWikilink as any];
  return (
    <article
      className={classNames(
        'prose',
        'prose-neutral',
        'prose-h1:mb-4',
        'prose-h2:my-4',
        'prose-h3:my-4',
        'prose-h4:my-4',
        'prose-h5:my-4',
        'prose-h6:my-4',
        'prose-a:my-0',
        'prose-p:my-2',
        'prose-ul:my-2',
        'prose-hr:my-4',
        'prose-table:my-2',
        className,
      )}
    >
      <ReactMarkdown
        components={components(renderWikilink)}
        remarkPlugins={remarkPlugins}
      >
        {markdown}
      </ReactMarkdown>
    </article>
  );
};

export default Markdown;
