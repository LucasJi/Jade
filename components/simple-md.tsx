import clsx from 'clsx';
import { Nodes } from 'hast';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';

const SimpleMarkdown = ({
  className,
  hast,
}: {
  className?: string;
  hast: Nodes;
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
        'prose-blockquote:border-s-obsidian',
        className,
      )}
    >
      {toJsxRuntime(hast, {
        Fragment,
        ignoreInvalidStyle: true,
        // @ts-ignore
        jsx,
        // @ts-ignore
        jsxs,
        passKeys: true,
        passNode: true,
      })}
    </article>
  );
};

export default SimpleMarkdown;
