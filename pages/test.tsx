import { unified } from 'unified';
import remarkParse from 'remark-parse';
import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import { wikiLinkPlugin } from 'utils';
import { reporter } from 'vfile-reporter';
import { useEffect, useState } from 'react';
import { GetServerSideProps, GetStaticProps } from 'next/types';
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
  return <a className="underline decoration-pink-300" {...omittedProps} />;
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
        remarkPlugins={[remarkGfm, wikiLinkPlugin]}
        rehypePlugins={[rehypeFormat, rehypeStringify]}
        components={{
          a: ({ className, ...props }) =>
            overwriteWikiLink({ className, ...props }),
        }}
      >
        {file}
      </ReactMarkdown>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async (context) => {
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
