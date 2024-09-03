import { Callout, CalloutBody, CalloutTitle } from '@/components/callout';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TypographyCode, TypographyP } from '@/components/ui/typography';
import { remarkCallout } from '@/plugins/remark-callout';
import remarkJade from '@/plugins/remark-jade';
import { remarkWikilink } from '@/plugins/remark-wikilink';
import { Post } from '@/types';
import clsx from 'clsx';
import Slugger from 'github-slugger';
import ReactMarkdown, { Components } from 'react-markdown'; // highlight.js doesn't support React.JSX syntax
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import Wikilink from './wikilink';

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

    return <h1>{props.children}</h1>;
  },
  h2: props => <h2 id={getHeadingId(props)}>{props.children}</h2>,
  h3: props => <h3 id={getHeadingId(props)}>{props.children}</h3>,
  h4: props => <h4 id={getHeadingId(props)}>{props.children}</h4>,
  h5: props => <h5 id={getHeadingId(props)}>{props.children}</h5>,
  h6: props => <h6 id={getHeadingId(props)}>{props.children}</h6>,
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
  li: props => <li>{props.children}</li>,
  table: props => <Table className="not-prose">{props.children}</Table>,
  thead: props => <TableHeader>{props.children}</TableHeader>,
  tr: props => <TableRow className="not-prose">{props.children}</TableRow>,
  th: props => <TableHead>{props.children}</TableHead>,
  tbody: props => <TableBody className="not-prose">{props.children}</TableBody>,
  td: props => <TableCell className="not-prose">{props.children}</TableCell>,
  code: props => (
    <TypographyCode className="not-prose">{props.children}</TypographyCode>
  ),
  p: props => <TypographyP>{props.children}</TypographyP>,
  div: props => {
    if ('data-callout' in props) {
      const type = (props as any)['data-callout-type'];
      return <Callout variant={type}>{props.children}</Callout>;
    }

    if ('data-callout-title' in props) {
      return <CalloutTitle title={props.children as string} />;
    }

    if ('data-callout-body' in props) {
      return <CalloutBody>{props.children}</CalloutBody>;
    }

    return <div>{props.children}</div>;
  },
  summary: props => <CalloutTitle title={props.children as string} />,
  details: props => {
    let variant = 'default';
    if ('data-callout' in props) {
      variant = (props as any)['data-callout-type'];
    }
    return <Callout variant={variant}>{props.children}</Callout>;
  },
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
