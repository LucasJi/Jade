import dedent from 'dedent';
import type * as hast from 'hast';
import type * as mdast from 'mdast';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { describe, expect, test } from 'vitest';
import { remarkTag } from '../plugin';

const process = async (md: string) => {
  let hast: hast.Node;
  let mdast: mdast.Root;
  const html = (
    await unified()
      .use(remarkParse)
      .use(remarkTag)
      .use(() => (tree: mdast.Root) => {
        mdast = tree;
        return mdast;
      })
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(() => (tree: hast.Node) => {
        hast = tree;
        return hast;
      })
      .use(rehypeStringify)
      .process(md)
  ).toString();

  console.log(html);

  // @ts-expect-error: hast and mdast is assigned
  return { hast, mdast, html };
};

describe('remarkTag', () => {
  // 测试基本的标签解析
  test('应该正确解析单个标签', async () => {
    const md = dedent`
      Hello #tag world
    `;
    const { mdast } = await process(md);
    const paragraph = mdast.children[0] as { children: Array<any> };
    expect(paragraph.children).toHaveLength(3);
    expect(paragraph.children[1]).toMatchObject({
      type: 'tag',
      value: 'tag',
      data: {
        hName: 'section',
        hProperties: {
          'data-tag': 'tag',
        },
      },
    });
  });

  // 测试多个标签的解析
  test('应该正确解析多个标签', async () => {
    const input = 'Hello #tag1 world #tag2';
    const { mdast } = await process(input);
    const paragraph = mdast.children[0] as any;
    expect(paragraph.children).toHaveLength(4);
    expect(paragraph.children[1]).toMatchObject({
      type: 'tag',
      value: 'tag1',
    });
    expect(paragraph.children[3]).toMatchObject({
      type: 'tag',
      value: 'tag2',
    });
  });

  // 测试代码块中的标签
  test('不应解析代码块中的标签', async () => {
    const input = '```\nThis is #not-a-tag\n```';
    const { html } = await process(input);
    expect(html).toContain('#not-a-tag');
  });

  // 测试行内代码中的标签
  test('不应解析行内代码中的标签', async () => {
    const input = 'This is `#not-a-tag` inline code';
    const { html } = await process(input);
    expect(html).not.contain('<section data-tag="not-a-tag"></section>');
  });

  // 测试复杂标签格式
  test('应该支持包含特殊字符的标签', async () => {
    const input = '#tag-with-dash #tag_with_underscore #tag/with/slash';
    const { mdast } = await process(input);
    const paragraph = mdast.children[0] as any;
    expect(paragraph.children).toHaveLength(5);
    expect(paragraph.children[0]).toMatchObject({
      type: 'tag',
      value: 'tag-with-dash',
    });
    expect(paragraph.children[2]).toMatchObject({
      type: 'tag',
      value: 'tag_with_underscore',
    });
    expect(paragraph.children[4]).toMatchObject({
      type: 'tag',
      value: 'tag/with/slash',
    });
  });

  // 测试标签边界情况
  test('应该正确处理标签边界情况', async () => {
    const input = '#tag.#tag,#tag!';
    const { mdast } = await process(input);
    const paragraph = mdast.children[0] as any;
    expect(paragraph.children).toHaveLength(2);
    expect(paragraph.children[0]).toMatchObject({
      type: 'tag',
      value: 'tag',
    });
  });

  // 只包含数字
  test('标签无法只包含数字', async () => {
    const input = '#1996';
    const { html } = await process(input);
    expect(html).eq('<p>#1996</p>');
  });
});
