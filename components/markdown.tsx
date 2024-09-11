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
import { TypographyCode } from '@/components/ui/typography';
import { cn } from '@/lib/utils';
import { remarkCallout } from '@/plugins/remark-callout';
import remarkHighlight from '@/plugins/remark-highlight';
import remarkJade from '@/plugins/remark-jade';
import { remarkTaskList } from '@/plugins/remark-task-list';
import { remarkWikilink } from '@/plugins/remark-wikilink';
import { Note } from '@/types';
import clsx from 'clsx';
import { CornerDownLeft, ExternalLink } from 'lucide-react';
import { Children, ReactElement, cloneElement } from 'react';
import ReactMarkdown, { Components } from 'react-markdown'; // highlight.js doesn't support React.JSX syntax
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import remarkBreaks from 'remark-breaks';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import Wikilink from './wikilink';

const components = (
  renderWikilink: boolean,
  currentNote: Note,
): Components => ({
  a: props => {
    const { node, className, href, children, ...rest } = props;
    if ('data-wikilink' in rest && href) {
      return renderWikilink ? (
        <Wikilink wikilink={href} currentNote={currentNote}>
          {children}
        </Wikilink>
      ) : (
        <span>{children}</span>
      );
    }

    if ('data-footnote-ref' in rest) {
      return (
        <a
          href={href!}
          title={href}
          className={cn(className, 'text-obsidian no-underline')}
          {...rest}
        >
          <span>
            <span>[</span>
            {children}
            <span>]</span>
          </span>
        </a>
      );
    }

    if ('data-footnote-backref' in rest) {
      return (
        <a
          href={href!}
          title={href}
          className={cn(
            className,
            'inline-flex items-center text-obsidian no-underline',
          )}
          {...rest}
        >
          <CornerDownLeft size={12} />
        </a>
      );
    }

    return (
      <a
        href={href!}
        target="_blank"
        title={href}
        className={cn(className, 'inline-flex items-center px-1 text-obsidian')}
        {...rest}
      >
        <span>{children}</span>
        <ExternalLink size={12} />
      </a>
    );
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
    let language = codeClassName?.flatMap(cls => {
      const match = /language-(\w+)/.exec(cls);
      return match ? [match[1]] : [];
    })[0];

    if (language === 'md') {
      language = 'text';
    }

    return (
      <SyntaxHighlighter style={oneLight} language={language}>
        {(code.children[0] as any).value.replace(/\n$/, '')}
      </SyntaxHighlighter>
    );
  },
  table: props => <Table className="not-prose">{props.children}</Table>,
  thead: props => <TableHeader>{props.children}</TableHeader>,
  tr: props => <TableRow className="not-prose">{props.children}</TableRow>,
  th: props => <TableHead>{props.children}</TableHead>,
  tbody: props => <TableBody className="not-prose">{props.children}</TableBody>,
  td: props => <TableCell className="not-prose">{props.children}</TableCell>,
  code: props => (
    <TypographyCode className="not-prose">{props.children}</TypographyCode>
  ),
  div: props => {
    if ('data-callout' in props) {
      const type = (props as any)['data-callout-type'];
      const isFoldable = (props as any)['data-is-foldable'] !== undefined;
      const defaultFolded = (props as any)['data-default-folded'] !== undefined;
      return (
        <Callout
          variant={type}
          isFoldable={isFoldable}
          defaultFolded={defaultFolded}
        >
          {props.children}
        </Callout>
      );
    }

    if ('data-callout-title' in props) {
      const type = (props as any)['data-callout-type'];
      const isFoldable = (props as any)['data-is-foldable'] !== undefined;
      return (
        <CalloutTitle
          title={props.children as string}
          variant={type}
          isFoldable={isFoldable}
        />
      );
    }

    if ('data-callout-body' in props) {
      return <CalloutBody>{props.children}</CalloutBody>;
    }

    return <div>{props.children}</div>;
  },
  ul: props => {
    const { node, children, className, ...rest } = props;
    const isTaskList = !!className?.includes('contains-task-list');
    const customChildren = Children.map(children, child => {
      if (isTaskList && (child as ReactElement).type === 'li') {
        const reactChild = child as ReactElement;
        return cloneElement(reactChild, {
          className: cn(
            (child as ReactElement).props.className,
            'ps-0',
            '[&_ul]:ps-4',
          ),
        });
      }

      return child;
    });
    return (
      <ul
        className={cn(className, {
          'list-none ps-0': isTaskList,
        })}
        {...rest}
      >
        {customChildren}
      </ul>
    );
  },
  section: props => {
    const { node, children, className, ...rest } = props;

    // footnotes
    if ('data-footnotes' in rest) {
      return (
        <section className={className} {...rest}>
          {Children.map(children, child => {
            // TODO: Use 'ol' type to custom footnotes section
            if ((child as ReactElement).props?.node?.tagName !== 'h2') {
              return child;
            }
            return <hr />;
          })}
        </section>
      );
    }

    return (
      <section className={className} {...rest}>
        {children}
      </section>
    );
  },
});

const Markdown = ({
  className,
  renderWikilink = true,
  wikilink = '',
  note,
}: {
  className?: string;
  renderWikilink?: boolean;
  wikilink?: string;
  note: Note;
}) => {
  const { title, content, frontmatter } = note;
  return (
    <ScrollArea className="overflow-x-auto">
      <article
        className={clsx(
          'prose',
          'prose-gray',
          'prose-h1:mb-4',
          'prose-h2:my-4',
          'prose-h3:my-4',
          'prose-h4:my-4',
          'prose-h5:my-4',
          'prose-h5:font-semibold',
          'prose-h6:my-4',
          'prose-h6:font-semibold',
          'prose-a:my-0',
          'prose-p:my-2',
          'prose-p:before:content-none prose-p:after:content-none',
          'prose-ul:my-2',
          'prose-li:my-0',
          'prose-hr:my-4',
          'prose-blockquote:border-s-obsidian',
          className,
        )}
      >
        <ReactMarkdown
          components={components(renderWikilink, note)}
          remarkPlugins={[
            remarkGfm,
            remarkBreaks,
            remarkHighlight,
            remarkTaskList,
            remarkFrontmatter,
            remarkCallout,
            remarkMath,
            remarkWikilink,
            [remarkJade as any, { title, wikilink }],
          ]}
          // TODO: Support rehypeMathjaxCHtml
          rehypePlugins={[rehypeRaw as any, rehypeKatex, rehypeSlug]}
        >
          {content}
        </ReactMarkdown>
      </article>
    </ScrollArea>
  );
};

export default Markdown;
