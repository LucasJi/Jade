import { transformNoteToVFile } from '@/processor/transformer/vFile';
import dedent from 'dedent';
import { toHtml } from 'hast-util-to-html';
import { Root } from 'mdast';
import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { matter } from 'vfile-matter';
import { describe, expect, test } from 'vitest';
import { transformSubHeadings, transformTitle } from '../mdast';

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

const getMdast = (md: string) => {
  const vFile = transformNoteToVFile(md);
  matter(vFile);
  const mdast = processor.parse(vFile);
  transformTitle(mdast, vFile.data.matter as any, noteFilename);
  return mdast;
};

const getHast = (mdast: Root) => processor.runSync(mdast);

const getHtml = (md: string) => {
  const hast = processor.runSync(getMdast(md));
  return toHtml(hast);
};

describe('transformTitle', () => {
  test('When frontmatter has title prop, using it as note title', async () => {
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

  test('When frontmatter does not have title prop and there is a # heading, then use # heading as note title', async () => {
    const md = dedent`
    ---
    created: 1970/1/1
    ---
    
    # ${titleInHeading}
    `;
    const html = getHtml(md);

    expect(html).toBe(`<h1>${titleInHeading}</h1>`);
  });

  test('When there is not title prop in the frontmatter and # heading, then use filename as note title', async () => {
    const md = dedent`
    ---
    created: 1970/1/1
    ---
    
    `;
    const html = getHtml(md);

    expect(html).toBe(`<h1>${noteFilename}</h1>`);
  });
});

describe('transformSubHeadings', () => {
  test('', () => {
    const md = dedent`
    # Title
    
    ## 1
    
    ### 1.1 
    1.1 part
    
    ## 2
    
    ### 2.2
    2.2 part
    `;
    const mdast = getMdast(md);
    const headings = ['1', '1.1'];
    transformSubHeadings(mdast, headings);
    const hast = processor.runSync(mdast);
    const html = toHtml(hast);
    console.log(html);
    expect(html).toBe(`<h3>1.1</h3>\n<p>1.1 part</p>`);
  });
});

describe('', () => {
  test('', () => {
    const md = dedent`
    # Title
    
    ## 1
    
    Heading 2 part  
    
    **The title is 1**
    
    ### 1.1
    
    Heading 3 part  
    
    **The title is 1.1**
    
    ## 2
    
    Heading 2 part  
    
    **The title is 2**
    
    ### 2.2
    
    Heading 3 part  
    
    **The title is 2.2**
    `;
    const mdast = getMdast(md);
    // const hast = processor.runSync(mdast);
    const hast = JSON.parse(
      '{"type":"element","tagName":"p","properties":{},"children":[{"type":"text","value":"属性有自己的 "},{"type":"element","tagName":"a","properties":{"dataWikilink":"","href":"搜索"},"children":[{"type":"text","value":"搜索语法"}]},{"type":"text","value":"，你可以将其与其他搜索项和运算符一起使用。"},{"type":"element","tagName":"a","properties":{"dataWikilink":"","href":"搜索"},"children":[{"type":"text","value":"查看属性搜索语法"}]},{"type":"text","value":"。"}]}',
    );
    // removePosition(hast, { force: true });
    const html = toHtml(hast);
    console.log(html);
    // console.log(JSON.stringify(hast));
  });
});
