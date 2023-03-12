import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import { wikiLinkPlugin } from '../utils';
import { reporter } from 'vfile-reporter';
import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next/types';

Test.getInitialProps = async () => {
  let fileStr = '';
  await unified()
    .use(wikiLinkPlugin)
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeDocument, { title: '👋🌍' })
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process('[[Hello World]]')
    .then((file) => {
      console.error(reporter(file));
      fileStr = String(file);
    });
  console.log('getInitialProps:', fileStr);
  return { file: fileStr };
};

export default function Test({ file = '' }: { file?: string }) {
  // const [content, setContent] = useState<string>('');

  // useEffect(() => {}, []);

  return <div>test page</div>;
}
