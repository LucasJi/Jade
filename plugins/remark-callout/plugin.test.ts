import dedent from 'dedent';
import type * as hast from 'hast';
import { JSDOM } from 'jsdom';
import type * as mdast from 'mdast';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { beforeAll, describe, expect, test } from 'vitest';
import { parseCallout, remarkCallout, type Options } from './plugin';

const process = async (md: string, options?: Options) => {
  let hast: hast.Node;
  let mdast: mdast.Root;
  const html = (
    await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkCallout, options)
      .use(() => (tree: mdast.Root) => {
        mdast = tree;
        return mdast;
      })
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
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

describe('parseCallout', () => {
  test('should parse callout without title', () => {
    const text = '[!info]';
    const callout = parseCallout(text);
    expect(callout?.type).toBe('info');
    expect(callout?.isFoldable).toBe(false);
    expect(callout?.defaultFolded).toBe(undefined);
    expect(callout?.title).toBe('Info');
  });

  test('should parse callout with uppercase type', () => {
    const text = '[!INFO]';
    const callout = parseCallout(text);
    expect(callout?.type).toBe('INFO');
    expect(callout?.isFoldable).toBe(false);
    expect(callout?.defaultFolded).toBe(undefined);
    expect(callout?.title).toBe('Info');
  });

  test('should parse callout with spaces in type', () => {
    const text = '[!type with spaces]';
    const callout = parseCallout(text);
    expect(callout?.type).toBe('type with spaces');
    expect(callout?.isFoldable).toBe(false);
    expect(callout?.defaultFolded).toBe(undefined);
    expect(callout?.title).toBe('Type with spaces');
  });

  test('should parse callout only with foldable (-)', () => {
    const text = '[!info]-';
    const callout = parseCallout(text);
    expect(callout?.type).toBe('info');
    expect(callout?.isFoldable).toBe(true);
    expect(callout?.defaultFolded).toBe(true);
    expect(callout?.title).toBe('Info');
  });

  test('should parse callout only with foldable (+)', () => {
    const text = '[!info]+';
    const callout = parseCallout(text);
    expect(callout?.type).toBe('info');
    expect(callout?.isFoldable).toBe(true);
    expect(callout?.defaultFolded).toBe(false);
    expect(callout?.title).toBe('Info');
  });

  test('should parse callout with title', () => {
    const text = '[!info] Hello, world! ';
    const callout = parseCallout(text);
    expect(callout?.type).toBe('info');
    expect(callout?.isFoldable).toBe(false);
    expect(callout?.defaultFolded).toBe(undefined);
    expect(callout?.title).toBe('Hello, world! ');
  });

  test('should parse callout with multiple spaces between type and title', () => {
    const text = '[!info]    Hello, world! ';
    const callout = parseCallout(text);
    expect(callout?.type).toBe('info');
    expect(callout?.isFoldable).toBe(false);
    expect(callout?.defaultFolded).toBe(undefined);
    expect(callout?.title).toBe('   Hello, world! ');
  });

  test('should parse callout with [brackets] in title', () => {
    const text = '[!info] Title [123]';
    const callout = parseCallout(text);
    expect(callout?.type).toBe('info');
    expect(callout?.isFoldable).toBe(false);
    expect(callout?.defaultFolded).toBe(undefined);
    expect(callout?.title).toBe('Title [123]');
  });

  test('should parse callout with title and foldable (-)', () => {
    const text = '[!info]- Hello, world! ';
    const callout = parseCallout(text);
    expect(callout?.type).toBe('info');
    expect(callout?.isFoldable).toBe(true);
    expect(callout?.defaultFolded).toBe(true);
    expect(callout?.title).toBe('Hello, world! ');
  });

  test('should parse callout with title and foldable (+)', () => {
    const text = '[!info]+ Hello, world! ';
    const callout = parseCallout(text);
    expect(callout?.type).toBe('info');
    expect(callout?.isFoldable).toBe(true);
    expect(callout?.defaultFolded).toBe(false);
    expect(callout?.title).toBe('Hello, world! ');
  });

  test('should not parse callout with no type', () => {
    const text = '[!]';
    const callout = parseCallout(text);
    expect(callout).toBe(undefined);
  });

  test('should not parse callout with no type and title', () => {
    const text = '[!] Hello, world!';
    const callout = parseCallout(text);
    expect(callout).toBe(undefined);
  });

  test('should not parse callout with no type and title and foldable (-)', () => {
    const text = '[!]- Hello, world!';
    const callout = parseCallout(text);
    expect(callout).toBe(undefined);
  });

  test('should not parse callout with no type and title and foldable (+)', () => {
    const text = '[!]+ Hello, world!';
    const callout = parseCallout(text);
    expect(callout).toBe(undefined);
  });

  test('should not parse callout with invalid foldable format', () => {
    const text = '[!warn]? Hello, world!';
    const callout = parseCallout(text);
    expect(callout).toBe(undefined);
  });

  test('should not parse callout with missing space', () => {
    const text = '[!warn]Hello, world!';
    const callout = parseCallout(text);
    expect(callout).toBe(undefined);
  });
});

describe('remarkCallout', () => {
  let jsdom: JSDOM;
  let parser: DOMParser;

  beforeAll(() => {
    jsdom = new JSDOM();
    parser = new jsdom.window.DOMParser();
  });

  test('empty blockquote', async () => {
    const md = dedent`
      >
    `;

    const { html } = await process(md);
    const doc = parser.parseFromString(html, 'text/html');

    const blockquote = doc.querySelector('blockquote');
    expect(blockquote).not.toBe(null);
  });

  test('callout with title and body', async () => {
    const md = dedent`
      > [!note] title here
      > body here
    `;

    const { html } = await process(md);
    const doc = parser.parseFromString(html, 'text/html');

    const callout = doc.querySelector('[data-callout]');
    expect(callout).not.toBe(null);
    expect(callout?.getAttribute('data-callout-type')).toBe('note');
    expect(callout?.tagName.toLowerCase()).toBe('div');
    expect(callout?.getAttribute('open')).toBe(null);

    const calloutTitle = callout?.querySelector('[data-callout-title]');
    expect(calloutTitle?.textContent).toBe('title here');

    const calloutBody = callout?.querySelector('[data-callout-body]');
    expect(calloutBody?.children[0].textContent).toBe('body here');
  });

  test('callout with empty first line', async () => {
    const md = dedent`
      >
      > [!info]
      > body here
    `;

    const { html } = await process(md);
    const doc = parser.parseFromString(html, 'text/html');

    const callout = doc.querySelector('[data-callout]');
    expect(callout).toBe(null);
  });

  test('callout with title and without body', async () => {
    const md = dedent`
      > [!note] title here
    `;

    const { html } = await process(md);

    const doc = parser.parseFromString(html, 'text/html');

    const callout = doc.querySelector('[data-callout]');
    expect(callout).not.toBe(null);
    expect(callout?.getAttribute('data-callout-type')).toBe('note');
    expect(callout?.tagName.toLowerCase()).toBe('div');
    expect(callout?.getAttribute('open')).toBe(null);
    expect(callout?.children.length).toBe(1);

    const calloutTitle = callout?.querySelector('[data-callout-title]');
    expect(calloutTitle).not.toBe(null);
    expect(calloutTitle?.textContent).toBe('title here');

    const calloutBody = callout?.querySelector('[data-callout-body]');
    expect(calloutBody).toBe(null);
  });

  test('callout without title and body', async () => {
    const md = dedent`
      > [!note]
    `;

    const { html } = await process(md);
    const doc = parser.parseFromString(html, 'text/html');

    const callout = doc.querySelector('[data-callout]');
    expect(callout).not.toBe(null);
    expect(callout?.getAttribute('data-callout-type')).toBe('note');
    expect(callout?.tagName.toLowerCase()).toBe('div');
    expect(callout?.getAttribute('open')).toBe(null);
    expect(callout?.children.length).toBe(1);

    const calloutTitle = callout?.querySelector('[data-callout-title]');
    expect(calloutTitle).not.toBe(null);
    expect(calloutTitle?.textContent).toBe('Note');

    const calloutBody = callout?.querySelector('[data-callout-body]');
    expect(calloutBody).toBe(null);
  });

  test('callout with title consisting of multiple nodes', async () => {
    const md = dedent`
      > [!note] The **reason** for why _this_ ~~is~~ \`true\` when $a=1$.
      > body here
    `;

    const { html } = await process(md);
    const doc = parser.parseFromString(html, 'text/html');

    const callout = doc.querySelector('[data-callout]');
    expect(callout).not.toBe(null);
    expect(callout?.getAttribute('data-callout-type')).toBe('note');
    expect(callout?.tagName.toLowerCase()).toBe('div');
    expect(callout?.getAttribute('open')).toBe(null);

    const calloutTitle = callout?.querySelector('[data-callout-title]');
    expect(calloutTitle?.innerHTML).toBe(
      'The <strong>reason</strong> for why <em>this</em> <del>is</del> <code>true</code> when <code class="language-math math-inline">a=1</code>.',
    );

    const calloutBody = callout?.querySelector('[data-callout-body]');
    expect(calloutBody?.children[0].textContent).toBe('body here');
  });

  test('callout with body consisting of multiple nodes', async () => {
    const md = dedent`
      > [!warn] title here \`inline code\`
      > body first line \`code\` here
      >
      > - list 1
      > - list 2
      >
      > \`\`\`js
      > console.log("Hello, World!")
      > \`\`\`
    `;

    const { html } = await process(md);

    const doc = parser.parseFromString(html, 'text/html');

    const callout = doc.querySelector('[data-callout]');
    expect(callout).not.toBe(null);
    expect(callout?.getAttribute('data-callout-type')).toBe('warn');
    expect(callout?.tagName.toLowerCase()).toBe('div');
    expect(callout?.getAttribute('open')).toBe(null);

    const calloutTitle = callout?.querySelector('[data-callout-title]');
    expect(calloutTitle?.innerHTML).toBe('title here <code>inline code</code>');

    const calloutBody = callout?.querySelector('[data-callout-body]');
    expect(calloutBody?.innerHTML).toBe(
      [
        '',
        '<p>body first line <code>code</code> here</p>',
        '<ul>',
        '<li>list 1</li>',
        '<li>list 2</li>',
        '</ul>',
        '<pre><code class="language-js">console.log("Hello, World!")',
        '</code></pre>',
        '',
      ].join('\n'),
    );
  });

  test('callout with type with spaces and special characters', async () => {
    const md = dedent`
      > [!type with spaces and special characters + - _ : ! & " ' ...]
      > body here
    `;

    const { html } = await process(md, {});
    const doc = parser.parseFromString(html, 'text/html');

    const callout = doc.querySelector('[data-callout]');
    expect(callout).not.toBe(null);
    expect(callout?.getAttribute('data-callout-type')).toBe(
      'type-with-spaces-and-special-characters-+---_-:-!-&-"-\'-...',
    );

    const calloutTitle = callout?.querySelector('[data-callout-title]');
    expect(calloutTitle?.textContent).toBe(
      'Type with spaces and special characters + - _ : ! & " \' ...',
    );
  });

  test('callout with empty titled paragraph', async () => {
    const md = [
      '> [!IMPORTANT]  ',
      '> Crucial information necessary for users to succeed.',
    ].join('\n');

    const { html } = await process(md);

    const doc = parser.parseFromString(html, 'text/html');

    const callout = doc.querySelector('[data-callout]');
    expect(callout).not.toBe(null);
    expect(callout?.getAttribute('data-callout-type')).toBe('important');
    expect(callout?.tagName.toLowerCase()).toBe('div');
    expect(callout?.getAttribute('open')).toBe(null);

    const calloutTitle = callout?.querySelector('[data-callout-title]');
    expect(calloutTitle?.innerHTML.trim()).toBe('Important<br>');

    const calloutBody = callout?.querySelector('[data-callout-body]');
    expect(calloutBody?.children[0].textContent).toBe(
      'Crucial information necessary for users to succeed.',
    );
  });

  test('foldable callout (-)', async () => {
    const md = dedent`
      > [!warn]- title here \`inline code\`
      > body first line \`code\` here
      >
      > - list 1
      > - list 2
      >
      > \`\`\`js
      > console.log("Hello, World!")
      > \`\`\`
    `;

    const { html } = await process(md);

    const doc = parser.parseFromString(html, 'text/html');

    const callout = doc.querySelector('[data-callout]');
    expect(callout).not.toBe(null);
    expect(callout?.getAttribute('data-callout-type')).toBe('warn');
    // expect(callout?.tagName.toLowerCase()).toBe('details');
    expect(callout?.getAttribute('open')).toBe(null);

    const calloutTitle = callout?.querySelector('[data-callout-title]');
    expect(calloutTitle?.innerHTML).toBe('title here <code>inline code</code>');

    const calloutBody = callout?.querySelector('[data-callout-body]');
    expect(calloutBody?.innerHTML).toBe(
      [
        '',
        '<p>body first line <code>code</code> here</p>',
        '<ul>',
        '<li>list 1</li>',
        '<li>list 2</li>',
        '</ul>',
        '<pre><code class="language-js">console.log("Hello, World!")',
        '</code></pre>',
        '',
      ].join('\n'),
    );
  });

  test('foldable callout (+)', async () => {
    const md = dedent`
      > [!warn]+ title here \`inline code\`
      > body first line \`code\` here
      >
      > - list 1
      > - list 2
      >
      > \`\`\`js
      > console.log("Hello, World!")
      > \`\`\`
    `;

    const { html } = await process(md);

    const doc = parser.parseFromString(html, 'text/html');

    const callout = doc.querySelector('[data-callout]');
    expect(callout).not.toBe(null);
    expect(callout?.getAttribute('data-callout-type')).toBe('warn');
    // expect(callout?.tagName.toLowerCase()).toBe('details');
    expect(callout?.getAttribute('open')).not.toBe(null);

    const calloutTitle = callout?.querySelector('[data-callout-title]');
    expect(calloutTitle?.innerHTML).toBe('title here <code>inline code</code>');

    const calloutBody = callout?.querySelector('[data-callout-body]');
    expect(calloutBody?.innerHTML).toBe(
      [
        '',
        '<p>body first line <code>code</code> here</p>',
        '<ul>',
        '<li>list 1</li>',
        '<li>list 2</li>',
        '</ul>',
        '<pre><code class="language-js">console.log("Hello, World!")',
        '</code></pre>',
        '',
      ].join('\n'),
    );
  });

  test('callout with strong, emphasis, and inline code', async () => {
    const md = dedent`
      > [!warn] title here
      > body **first** _line_ \`code\` here
    `;

    const { html } = await process(md);

    const doc = parser.parseFromString(html, 'text/html');

    const callout = doc.querySelector('[data-callout]');
    expect(callout).not.toBe(null);
    expect(callout?.getAttribute('data-callout-type')).toBe('warn');
    expect(callout?.tagName.toLowerCase()).toBe('div');
    expect(callout?.getAttribute('open')).toBe(null);
    expect(
      callout?.querySelector('[data-callout-body]')?.children[0].innerHTML,
    ).toBe('body <strong>first</strong> <em>line</em> <code>code</code> here');
  });

  test('callout with inner callout', async () => {
    const md = dedent`
      > [!question]+ Is Callout nestable?
      > Question Body
      > > [!todo]+ Yes
      > > Todo Body
      > > > [!example]+ Use multiple levels of nesting
      > > > Example Body
    `;

    const { html } = await process(md);
    const doc = parser.parseFromString(html, 'text/html');

    const questionCallout = doc.querySelector('[data-callout]');
    expect(questionCallout).not.toBe(null);
    expect(questionCallout?.getAttribute('data-callout-type')).eq('question');

    const todoCallout = questionCallout?.querySelector('[data-callout]');
    expect(todoCallout).not.toBe(null);
    expect(todoCallout?.getAttribute('data-callout-type')).eq('todo');

    const exampleCallout = todoCallout?.querySelector('[data-callout]');
    expect(exampleCallout).not.toBe(null);
    expect(exampleCallout?.getAttribute('data-callout-type')).eq('example');
  });

  test('options.root', async () => {
    const md = dedent`
      > [!warn] title here
      > body here
    `;

    const { html } = await process(md, {
      root: callout => ({
        tagName: 'callout',
        properties: {
          calloutType: callout.type,
          isFoldable: String(callout.isFoldable),
        },
      }),
    });

    const doc = parser.parseFromString(html, 'text/html');

    const callout = doc.querySelector('callout');
    expect(callout).not.toBe(null);
    expect(callout?.getAttribute('calloutType')).toBe('warn');
    expect(callout?.getAttribute('isFoldable')).toBe('false');
    expect(callout?.getAttribute('open')).toBe(null);

    const calloutTitle = callout?.querySelector('[data-callout-title]');
    expect(calloutTitle?.textContent).toBe('title here');

    const calloutBody = callout?.querySelector('[data-callout-body]');
    expect(calloutBody?.children[0].textContent).toBe('body here');
  });

  test('options.title', async () => {
    const md = dedent`
      > [!warn] title here
      > body here
    `;

    const { html } = await process(md, {
      title: callout => ({
        tagName: 'callout-title',
        properties: {
          className: 'callout-title',
          calloutType: callout.type,
        },
      }),
    });

    const doc = parser.parseFromString(html, 'text/html');

    const calloutTitle = doc.querySelector('.callout-title');
    expect(calloutTitle).not.toBe(null);
    expect(calloutTitle?.getAttribute('calloutType')).toBe('warn');
    expect(calloutTitle?.textContent).toBe('title here');
  });
});
