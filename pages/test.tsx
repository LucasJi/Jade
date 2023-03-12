import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import { wikiLinkPlugin } from 'utils';
import { GetStaticProps } from 'next/types';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import fs from 'fs';
import { join } from 'path';
import remarkGfm from 'remark-gfm';
import { omit } from 'lodash';

interface TestProps {
  file?: string;
}

function WikiLink(props: any) {
  const omittedProps = omit(props, ['className']);
  return (
    <a
      className="underline decoration-pink-300"
      {...omittedProps}
      onMouseEnter={() => {
        console.log('onMouseEnter');
      }}
      onMouseLeave={() => {
        console.log('onMouseLeave');
      }}
    />
  );
}

export default function Test({ file = '' }: TestProps) {
  const overwriteWikiLink = ({
    className,
    ...props
  }: {
    className: string | undefined;
  }) => {
    console.log(className);
    const isWikiLink = className?.includes('wiki-link');
    console.log('className contains wiki-link:', isWikiLink);
    return isWikiLink ? <WikiLink {...props} /> : <a {...props} />;
  };

  return (
    <div>
      <ReactMarkdown
        components={{
          a: ({ className, ...props }) =>
            overwriteWikiLink({ className, ...props }),
        }}
        rehypePlugins={[rehypeFormat, rehypeStringify]}
        remarkPlugins={[remarkGfm, wikiLinkPlugin]}
      >
        {file}
      </ReactMarkdown>
    </div>
  );
}

export const getStaticProps: GetStaticProps = () => {
  const postsDirectory = join(process.cwd(), 'posts');
  console.log('post directory:', postsDirectory);

  const demo = join(postsDirectory, 'wiki-link.md');

  const fileContents = fs.readFileSync(demo, 'utf-8');

  return {
    props: {
      file: fileContents,
    },
  };
};
