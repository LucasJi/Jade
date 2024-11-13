import { transformNoteToVFile } from '@/processor/transformer/vFile';
import dedent from 'dedent';
import { toHtml } from 'hast-util-to-html';
import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { matter } from 'vfile-matter';
import { describe, expect, test } from 'vitest';
import { transformTitle } from '../mdast';

const noteFilename = 'Note File Name';
const titleInFrontmatter = 'Frontmatter Title';
const titleInHeading = 'Heading Title';

const processor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkGfm)
  .use(remarkStringify)
  .use(remarkRehype, {
    allowDangerousHtml: false,
  })
  .use(rehypeStringify);

const getHtml = (md: string) => {
  const vFile = transformNoteToVFile(md);
  matter(vFile);
  const mdast = processor.parse(vFile);
  transformTitle(mdast, vFile.data.matter as any, noteFilename);
  const hast = processor.runSync(mdast);
  return toHtml(hast);
};

describe('transformTitle', () => {
  test('With frontmatter title prop, using it', async () => {
    const md = dedent`
    ---
    created: 1970/1/1
    title: ${titleInFrontmatter}
    ---
    
    # ${titleInHeading}
    `;

    const html = getHtml(md);

    console.log(html);

    expect(html).toBe(`<h1>${titleInFrontmatter}</h1>`);
  });

  test('With title heading and without frontmatter title prop, using title heading', async () => {
    const md = dedent`
    ---
    created: 1970/1/1
    ---
    
    # ${titleInHeading}
    `;
    const html = getHtml(md);

    expect(html).toBe(`<h1>${titleInHeading}</h1>`);
  });

  test('', async () => {
    const md = dedent`
    ---
    created: 1970/1/1
    ---
    
    # ${titleInHeading}
    `;

    console.log(await processor.process(md));
  });
});
