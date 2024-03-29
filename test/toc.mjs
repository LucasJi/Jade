import { readFileSync } from 'fs';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { toc } from 'mdast-util-toc';
const markdownContent = readFileSync('_posts/tech/java/spring.md', 'utf8');

const tree = fromMarkdown(markdownContent);

const result = toc(tree);

console.log(result.map.children[0].children[1].children);
