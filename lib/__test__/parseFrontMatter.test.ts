import path from 'path';
import { read } from 'to-vfile';
import { describe, test } from 'vitest';
import { parseFrontMatter } from '../server-utils';

describe('parse frontmatter', () => {
  test('ok', async () => {
    const mdVFile = await read(path.resolve(__dirname, 'test.md'));
    const result = await parseFrontMatter(mdVFile);
    console.log(result.data.matter);
  });
});
