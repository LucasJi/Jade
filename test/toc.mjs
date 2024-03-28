import { readFileSync } from 'fs';
import { toc } from 'mdast-util-toc';
import rehypeStringify from 'rehype-stringify';
import markdown from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
const markdownContent = readFileSync(
  '_posts/tech/javascript/Introduce front frameworks.md',
  'utf8',
);

function remarkToc() {
  return function (tree) {
    const result = toc(tree, {
      // heading: '(table[ -]of[ -])?contents?|toc',
    });

    console.log(JSON.stringify(result.map.children));

    const listItem = result.map.children[0];

    tree.children = [];

    if (listItem.children.length > 1) {
      tree.children = [result.map.children[0].children[1]];
    }
  };
}

const html = await unified()
  .use(markdown)
  .use(remarkToc)
  .use(remarkRehype)
  .use(rehypeStringify)
  .process(markdownContent);

console.log(html);
