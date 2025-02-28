import { Callout, CalloutBody, CalloutTitle } from '@/components/callout';
import EmbedFile from '@/components/embed-file';
import Frontmatter from '@/components/frontmatter';
import Mermaid from '@/components/mermaid';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TypographyCode } from '@/components/ui/typography';
import { cn } from '@/components/utils';
import clsx from 'clsx';
import { Nodes } from 'hast';
import {
  Components as JsxRuntimeComponents,
  toJsxRuntime,
} from 'hast-util-to-jsx-runtime';
import { endsWith, trimEnd } from 'lodash';
import { CornerDownLeft, ExternalLink } from 'lucide-react';
import { Children, cloneElement } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import InternalLink from './internal-link';

const components = (
  origin: string,
  vaultPaths: string[],
): Partial<JsxRuntimeComponents> => {
  let count = 0;
  return {
    a: props => {
      const { node, className, href, children, ...rest } = props;
      if ('data-wikilink' in rest && href) {
        const displayName = (children as string)
          .trim()
          .split('#')
          .filter(e => e !== '')
          .join(' > ');
        let trimmedHref = href;
        if (endsWith(href, '\\')) {
          trimmedHref = trimEnd(href, '\\');
        }
        return (
          <InternalLink
            origin={origin}
            displayName={displayName}
            link={trimmedHref}
            vaultPaths={vaultPaths}
          />
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
          className={cn(
            className,
            'inline-flex items-center px-1 text-obsidian',
          )}
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
        (child: any) => child.tagName === 'code',
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

      if (language === 'mermaid') {
        const text = (code.children[0] as any).value;
        const id = count;
        count++;
        return <Mermaid id={`m${id}`} source={text} />;
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
    th: props => {
      const { node, className, href, children, style, ...rest } = props;
      return <TableHead style={style}>{props.children}</TableHead>;
    },
    tbody: props => (
      <TableBody className="not-prose">{props.children}</TableBody>
    ),
    td: props => {
      const { node, className, href, children, style, ...rest } = props;

      return (
        <TableCell className="not-prose" style={style}>
          {props.children}
        </TableCell>
      );
    },
    code: props => (
      <TypographyCode className="not-prose">{props.children}</TypographyCode>
    ),
    div: props => {
      if ('data-callout' in props) {
        const type = (props as any)['data-callout-type'];
        const isFoldable = (props as any)['data-is-foldable'] !== undefined;
        const defaultFolded =
          (props as any)['data-default-folded'] !== undefined;
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

      // obsidian comment
      if ('hidden' in props) {
        return <span className="hidden">{props.children}</span>;
      }

      return <div>{props.children}</div>;
    },
    ul: props => {
      const { node, children, className, ...rest } = props;
      const isTaskList = !!className?.includes('contains-task-list');
      const customChildren = Children.map(children, child => {
        if (isTaskList && child.type === 'li') {
          return cloneElement(child, {
            className: cn(child.props.className, 'ps-0', '[&_ul]:ps-4'),
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
            <hr />
            {Children.map(children, child => {
              // TODO: Use 'ol' type to custom footnotes section
              if (child.props?.node?.tagName !== 'h2') {
                return child;
              }
              return <hr />;
            })}
          </section>
        );
      }

      // embed file
      if ('data-embed-file' in rest) {
        return <EmbedFile path={children} />;
      }

      // frontmatter
      if ('data-frontmatter' in rest) {
        return <Frontmatter frontmatter={children} className="mb-4" />;
      }

      return (
        <section className={className} {...rest}>
          {children}
        </section>
      );
    },
    p: props => {
      const { node, children, className, ...rest } = props;
      for (const child of node.children) {
        if (child.properties) {
          const { dataEmbedFile } = child.properties;
          if (dataEmbedFile) {
            return (
              <div className={cn('my-2', className)} {...rest}>
                {children}
              </div>
            );
          }
        }
      }
      return (
        <p className={className} {...rest}>
          {children}
        </p>
      );
    },
    span: props => {
      const { node, children, className, ...rest } = props;

      if ('data-tag' in rest) {
        return <span className="text-obsidian">{`#${rest['data-tag']}`}</span>;
      }

      return (
        <span className={className} {...rest}>
          {children}
        </span>
      );
    },
  };
};

const Markdown = ({
  className,
  hast,
  origin,
  vaultPaths,
}: {
  className?: string;
  hast: Nodes;
  origin: string;
  vaultPaths: string[];
}) => {
  return (
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
        'prose-img:my-0',
        'max-w-[360px] sm:max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg',
        className,
      )}
    >
      {toJsxRuntime(hast, {
        Fragment,
        components: components(origin, vaultPaths),
        ignoreInvalidStyle: true,
        // @ts-ignore
        jsx,
        // @ts-ignore
        jsxs,
        passKeys: true,
        passNode: true,
        development: false,
      })}
    </article>
  );
};

export default Markdown;
