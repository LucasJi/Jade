import { fromMarkdown } from 'mdast-util-from-markdown';
import { describe, test } from 'vitest';

describe('micromark', () => {
  test('basic', async () => {});
});

describe('remarkEmbed', () => {
  test('test', async () => {
    const md =
      '![Engelbart|100x145](https://history-computer.com/ModernComputer/Basis/images/Engelbart.jpg)';
    const root = fromMarkdown(md);
    console.log(JSON.stringify(root));
  });
});
