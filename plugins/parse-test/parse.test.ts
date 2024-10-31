import { readFileSync } from 'fs';
import type * as mdast from 'mdast';
import path from 'path';
import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, test } from 'vitest';

const md = readFileSync(path.join(__dirname, 'test.md'));
const blockIdentifier = new RegExp(/^\^[a-zA-Z0-9-]+$/);

describe('parse', () => {
  test('1', async () => {
    await unified()
      .use(remarkParse)
      .use(remarkFrontmatter)
      .use(remarkGfm)
      .use(() => (tree: mdast.Root) => {
        console.log(JSON.stringify(tree));
        return tree;
      })
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify)
      .process(md);
  });
});
