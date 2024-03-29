import { readFileSync } from 'fs';

import { fromMarkdown } from 'mdast-util-from-markdown';
import { toc } from 'mdast-util-toc';

const filepath = '_posts/tech/java/spring.md';
const markdownContent = readFileSync(
  '/home/lucas/quartz/docs/authoring content.md',
  // filepath,
  'utf8',
);

const TITLE_REG = /^#\s+.+/;
const HEADING_REG = /^(#{1,6})\s+.+/;

const removeTitle = post => {
  const tokens = post.split('\n');
  const restTokens = tokens
    .filter(token => !TITLE_REG.test(token))
    .filter(token => HEADING_REG.test(token));
  return restTokens.join('\n');
};

const resolvedPost = removeTitle(markdownContent);

const tree = fromMarkdown(resolvedPost);

const result = toc(tree);

console.log(JSON.stringify(result.map.children));
