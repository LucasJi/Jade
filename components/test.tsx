import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
import { reporter } from 'vfile-reporter';
import { useEffect } from 'react';

function Test() {
  useEffect(() => {
    console.log('Hi, I am a test effect~');

    unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeDocument, { title: '👋🌍' })
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process('# Hello world!')
      .then((file) => {
        console.error(reporter(file));
        console.log(String(file));
      });
  }, []);

  return <div>Test Component</div>;
}

export default Test;
