import { readFileSync } from 'fs';

import { fromMarkdown } from 'mdast-util-from-markdown';
import { toc } from 'mdast-util-toc';
import * as os from 'node:os';

const filepath = '_posts/tech/java/spring.md';
const markdownContent = readFileSync(
  '/home/lucas/quartz/docs/authoring content.md',
  // filepath,
  'utf8',
);

const TITLE_REG = /^#\s+.+/;
const HEADING_REG = /^(#{1,6})\s+.+/;

const removeTitle = post => {
  const tokens = post.split(os.EOL);
  const restTokens = tokens
    .filter(token => !TITLE_REG.test(token))
    .filter(token => HEADING_REG.test(token));
  return restTokens.join(os.EOL);
};

const resolvedPost = removeTitle(markdownContent);

const tree = fromMarkdown(resolvedPost);

const result = toc(tree);

console.log(JSON.stringify(result.map.children));
