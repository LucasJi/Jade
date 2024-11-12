import dedent from 'dedent';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { describe, expect, test } from 'vitest';
import { frontYamlMatterHandler } from '../plugin';

describe('unified-matter', () => {
  test('handle frontmatter correctly', async () => {
    const md = dedent`
    ---
    key: value
    ---

    # Frontmatter Handler
    `;
    const file = await unified()
      .use(remarkParse)
      .use(remarkStringify)
      .use(remarkFrontmatter)
      .use(frontYamlMatterHandler)
      .process(md);

    const matter: any = file.data.matter;

    expect(matter.key).toBe('value');
  });
});
