import remarkGalaxy from '@lib/remark-galaxy';
import { remarkWikilink } from '@lib/remark-wikilink';
import { Link } from '@nextui-org/react';
import classNames from 'classnames';
import { Element, Text } from 'hast';
// import Link from 'next/link';
import ReactMarkdown, { Components } from 'react-markdown';
// highlight.js doesn't support React.JSX syntax
import { Frontmatter, Post } from '@/types';
import { Chip, Spacer } from '@nextui-org/react';
import Slugger from 'github-slugger';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import Wikilink from './Wikilink';

const slugs = new Slugger();

const getHeadingId = (props: any) => {
  const hContent = props.children[0] as string;
  slugs.reset();
  return slugs.slug(hContent);
};

const components = (
  renderWikilink: boolean,
  frontmatter?: Frontmatter,
): Components => ({
  a: props => {
    const { className, href, children } = props;
    if (className?.includes('wikilink')) {
      return renderWikilink ? (
        <Wikilink wikilink={href || ''}>{children}</Wikilink>
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
  h1: props => {
    const aliases: string[] | undefined = frontmatter?.aliases;
    const tags: string[] | undefined = frontmatter?.tags;

    return (
      <>
        <h1>{props.children}</h1>
        {aliases && (
          <div className="flex items-center">
            <span>Aliases:</span>
            <Spacer x={2} />
            {aliases.map((alias, idx) => (
              <>
                <Chip key={alias} size="sm">
                  {alias}
                </Chip>
                {idx < aliases.length - 1 && <Spacer x={1} />}
              </>
            ))}
          </div>
        )}
        {tags && (
          <div className="flex items-center">
            <span>Tags:</span>
            <Spacer x={2} />
            {tags.map((tag, idx) => (
              <>
                <Chip
                  key={tag}
                  size="sm"
                  variant="dot"
                  classNames={{
                    base: 'border-obsidian-purple',
                    content: 'text-obsidian-purple',
                    dot: 'text-obsidian-purple',
                  }}
                >
                  {tag}
                </Chip>
                {idx < tags.length - 1 && <Spacer x={1} />}
              </>
            ))}
          </div>
        )}
      </>
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

    const code = node?.children.find(
      child => (child as Element).tagName === 'code',
    ) as Element | undefined;

    if (!code) {
      return <pre className={className}>{children}</pre>;
    }

    const codeClassName = code.properties?.className as string[];
    const language = codeClassName?.flatMap(cls => {
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
    return (
      <code className="not-prose px-1 whitespace-break-spaces rounded bg-default-200">
        {props.children}
      </code>
    );
  },
  li: props => <li className="not-prose">{props.children}</li>,
});

const Markdown = ({
  className,
  renderWikilink = true,
  wikilink = '',
  post,
}: {
  className?: string;
  renderWikilink?: boolean;
  wikilink?: string;
  post: Post;
}) => {
  const { title, content, frontmatter } = post;
  return (
    <article
      className={classNames(
        'scroll-smooth',
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
        components={components(renderWikilink, frontmatter)}
        remarkPlugins={[
          remarkGfm,
          remarkFrontmatter,
          remarkWikilink as any,
          [remarkGalaxy as any, { title, wikilink }],
        ]}
        rehypePlugins={[rehypeRaw as any]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
};

export default Markdown;
