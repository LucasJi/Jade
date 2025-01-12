import { Wikilink } from '@/plugins/types';
import { convertNoteToVFile } from '@/processor/transformer/vFile';
import unifiedProcessor from '@/processor/unified';
import dedent from 'dedent';
import { toHtml } from 'hast-util-to-html';
import { Root } from 'mdast';
import { removePosition } from 'unist-util-remove-position';
import { Node, visit } from 'unist-util-visit';
import { matter } from 'vfile-matter';
import { describe, expect, test } from 'vitest';
import {
  convertFrontmatterToSection,
  determineFinalTitle,
  truncateMdast,
} from '../mdast';

const noteFilename = 'Note File Name';
const titleInFrontmatter = 'Frontmatter Title';
const titleInHeading = 'Heading Title';

const processor = unifiedProcessor;

const getMdast = (md: string) => {
  const vFile = convertNoteToVFile(md);
  matter(vFile);
  const mdast = processor.parse(vFile);
  determineFinalTitle(mdast, vFile.data.matter as any, noteFilename);
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

    expect(html).toBe(`<h1 id="frontmatter-title">${titleInFrontmatter}</h1>`);
  });

  test('When frontmatter does not have title prop and there is a # heading, then use # heading as note title', async () => {
    const md = dedent`
    ---
    created: 1970/1/1
    ---
    
    # ${titleInHeading}
    `;
    const html = getHtml(md);

    expect(html).toBe(`<h1 id="heading-title">${titleInHeading}</h1>`);
  });

  test('When there is not title prop in the frontmatter and # heading, then use filename as note title', async () => {
    const md = dedent`
    ---
    created: 1970/1/1
    ---
    
    `;
    const html = getHtml(md);

    expect(html).toBe(`<h1 id="note-file-name">${noteFilename}</h1>`);
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
    truncateMdast(mdast, headings);
    const hast = processor.runSync(mdast);
    const html = toHtml(hast);
    console.log(html);
    expect(html).toBe(`<h3 id="11">1.1</h3>\n<p>1.1 part</p>`);
  });
});

describe('transformFrontmatterToSection', () => {
  test('', () => {
    const md = dedent`
    ---
    key: value
    ---
    # Frontmatter Example
    `;
    const mdast = getMdast(md);
    convertFrontmatterToSection(mdast, '');
    const hast = processor.runSync(mdast);
    console.log(JSON.stringify(mdast));
    console.log(JSON.stringify(hast));
  });
});

describe('tests', () => {
  test('remove position test', () => {
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
    const hast = processor.runSync(mdast);
    // const html = toHtml(hast);
    removePosition(hast, { force: true });
    // console.log(JSON.stringify(mdast));
    console.log(JSON.stringify(hast));
  });

  test('wikilink collection test', () => {
    const md = dedent`
    # Wikilink Collection
    
    [[a]]
    
    [[b|alias-b]]
    
    [[c]]
    `;
    const mdast = getMdast(md);
    visit(
      mdast as Node,
      'wikilink',
      (node: Wikilink, index: number | null, parent) => {
        console.log(node.value, node.data.alias);
      },
    );
  });
});
