import dedent from 'dedent';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { describe, test } from 'vitest';
import { remarkTitle } from '../plugin';

describe('remark-title', () => {
  test('remark title from frontmatter', async () => {
    const md = dedent`
    ---
    created: 1970/1/1
    title: Test Markdown
    ---
    
    Markdown content
    `;
    const file = await unified()
      .use(remarkParse)
      .use(remarkStringify)
      .use(remarkFrontmatter)
      .use(remarkTitle)
      .process(md);

    console.log(file.toString());
  });
});
