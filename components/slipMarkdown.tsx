import remarkGfm from 'remark-gfm';
import wikilinkPlugin from '@utils/remark-wikilink';
import ReactMarkdown from 'react-markdown';
import { ReactNode } from 'react';
import Wikilink from './Wikilink';
import { Post } from '@types';

export function SlipMarkdown({
  onClickViewPost,
  content,
}: {
  onClickViewPost: (post: Post) => void;
  content: string;
}) {
  const wikilinkRender = ({
    className,
    href,
    children,
    ...props
  }: {
    className: string | undefined;
    href: string | undefined;
    children: ReactNode;
  }) => {
    const isWikiLink = className?.includes('wikilink');
    return isWikiLink && href ? (
      <Wikilink onClick={onClickViewPost} wikilink={href}>
        {children}
      </Wikilink>
    ) : (
      <a href={href} {...props} />
    );
  };

  return (
    <article className="prose prose-slate">
      <ReactMarkdown
        components={{
          a: props => {
            const { className, href, children } = props;
            return wikilinkRender({
              className,
              href,
              children,
            });
          },
        }}
        remarkPlugins={[remarkGfm, wikilinkPlugin]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
