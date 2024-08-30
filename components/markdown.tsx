import remarkJade from '@/plugins/remark-jade';
import { remarkWikilink } from '@/plugins/remark-wikilink';
import ReactMarkdown, { Components } from 'react-markdown'; // highlight.js doesn't support React.JSX syntax
import { Post } from '@/types';
import Slugger from 'github-slugger';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import Wikilink from './wikilink';
import clsx from 'clsx';
import { ScrollArea } from '@/components/ui/scroll-area';
import { remarkCallout } from '@/plugins/remark-callout';
import { InlineCode, Tr, Td, Th } from '@/components/ui/typography';

const slugs = new Slugger();

const getHeadingId = (props: any) => {
  if (!props?.children) {
    return '';
  }

  const hContent = props.children[0] as string;
  slugs.reset();
  return slugs.slug(hContent);
};

const components = (
  renderWikilink: boolean,
  currentPost: Post,
): Components => ({
  a: props => {
    const { className, href, children } = props;
    if (className?.includes('wikilink') && href) {
      return renderWikilink ? (
        <Wikilink wikilink={href} currentPost={currentPost}>
          {children}
        </Wikilink>
      ) : (
        <span>{children}</span>
      );
    }

    const isFragment = href?.startsWith('#');

    return (
      <a href={href!} target="_blank">
        {children}
      </a>
    );
  },
  h1: props => {
    const frontmatter = currentPost.frontmatter;
    const aliases: string[] | undefined = frontmatter?.aliases;
    const tags: string[] | undefined = frontmatter?.tags;

    return (
      <>
        <h1>{props.children}</h1>
        {/*{aliases && (*/}
        {/*  <div className="flex items-center">*/}
        {/*    <span className="text-sm">Aliases:</span>*/}
        {/*    <Spacer x={2} />*/}
        {/*    {aliases.map((alias, idx) => (*/}
        {/*      <div key={alias}>*/}
        {/*        <Chip variant="light" color="warning" size="sm">*/}
        {/*          {alias}*/}
        {/*        </Chip>*/}
        {/*        {idx < aliases.length - 1 && <Spacer x={1} />}*/}
        {/*      </div>*/}
        {/*    ))}*/}
        {/*  </div>*/}
        {/*)}*/}
        {/*{tags && (*/}
        {/*  <div className="flex items-center">*/}
        {/*    <span className="text-sm">Tags:</span>*/}
        {/*    <Spacer x={2} />*/}
        {/*    {tags.map((tag, idx) => (*/}
        {/*      <div key={tag}>*/}
        {/*        <Chip*/}
        {/*          size="sm"*/}
        {/*          variant="light"*/}
        {/*          classNames={{*/}
        {/*            content: 'text-obsidian-purple',*/}
        {/*          }}*/}
        {/*        >*/}
        {/*          {tag}*/}
        {/*        </Chip>*/}
        {/*        {idx < tags.length - 1 && <Spacer x={1} />}*/}
        {/*      </div>*/}
        {/*    ))}*/}
        {/*  </div>*/}
        {/*)}*/}
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
      child => (child as any).tagName === 'code',
    ) as any | undefined;

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
        {(code.children[0] as any).value.replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <pre className={clsx(className)}>{children}</pre>
    );
  },
  // TODO make the style configurable
  // code: props => {
  //   return (
  //     <code className="px-1 whitespace-break-spaces rounded">
  //       {props.children}
  //     </code>
  //   );
  // },
  li: props => <li>{props.children}</li>,
  table: props => <table className="w-full">{props.children}</table>,
  tr: props => <Tr>{props.children}</Tr>,
  th: props => <Th>{props.children}</Th>,
  td: props => <Td>{props.children}</Td>,
  code: props => <InlineCode>{props.children}</InlineCode>,
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
    <ScrollArea>
      <article
        className={clsx(
          'prose',
          'prose-gray',
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
          className,
        )}
      >
        <ReactMarkdown
          components={components(renderWikilink, post)}
          remarkPlugins={[
            remarkGfm,
            remarkFrontmatter,
            remarkCallout,
            remarkWikilink as any,
            [remarkJade as any, { title, wikilink }],
          ]}
          rehypePlugins={[rehypeRaw as any]}
        >
          {content}
        </ReactMarkdown>
      </article>
    </ScrollArea>
  );
};

export default Markdown;
