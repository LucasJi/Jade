import { convertNoteToVFile } from '@/processor/transformer/vFile';
import unifiedProcessor from '@/processor/unified';
import dedent from 'dedent';
import { Root } from 'mdast';
import { removePosition } from 'unist-util-remove-position';
import { matter } from 'vfile-matter';
import { describe, test } from 'vitest';
import { truncateHast } from '../hast';

const processor = unifiedProcessor;

const getMdast = (md: string) => {
  const vFile = convertNoteToVFile(md);
  matter(vFile);
  return processor.parse(vFile);
};

const getHast = (mdast: Root) => processor.runSync(mdast);

describe('truncateHast', () => {
  test('When giving sub headings then should return sub hast', async () => {
    const md = dedent`
    # 1
    
    ## 2
   
    2 
    
    ### 3
    
    3
    
    ## 4
    
    4
    `;

    const hast = getHast(getMdast(md));
    removePosition(hast, { force: true });
    truncateHast(hast, ['1', '2', '3']);
    console.log(hast);
  });
});
