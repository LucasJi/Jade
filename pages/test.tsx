import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import { wikiLinkPlugin } from 'utils';
import { reporter } from 'vfile-reporter';
import { useEffect, useState } from 'react';
import { GetServerSideProps, GetStaticProps } from 'next/types';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';

export const getStaticProps: GetStaticProps = async (context) => {
  return {
    props: {},
  };
};

export default function Test({ file = '' }: { file?: string }) {
  // const [content, setContent] = useState<string>('');

  // useEffect(() => {}, []);

  const markdown: string = '[[Hello Wiki Link!]]';

  return (
    <div>
      <ReactMarkdown remarkPlugins={[wikiLinkPlugin]}>{markdown}</ReactMarkdown>
    </div>
  );
}
