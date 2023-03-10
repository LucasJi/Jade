import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';
import rehypeStringify from 'rehype-stringify';
// @ts-ignore
import wikiLinkPlugin from 'remark-wiki-link';
import { reporter } from 'vfile-reporter';
import { useEffect, useState } from 'react';

function Test() {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    unified()
      .use(wikiLinkPlugin)
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeDocument, { title: '👋🌍' })
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process('[[Hello World]]')
      .then((file) => {
        console.error(reporter(file));
        // setContent(String(file));
        console.log(String(file));
      });
  }, []);

  return <div>{content}</div>;
}

export default Test;
