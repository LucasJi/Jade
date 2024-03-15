import { readFileSync } from 'fs';
import { toc } from 'mdast-util-toc';
import rehypeStringify from 'rehype-stringify';
import markdown from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
const markdownContent = readFileSync('_posts/tech/java/spring.md', 'utf8');

// 使用 unified 处理器和 remark-parse 解析器来解析 Markdown
const tree = unified().use(markdown).parse(markdownContent);

// console.log(tree.children);

// 生成目录
const result = toc(tree, {
  heading: '(table[ -]of[ -])?contents?|toc',
});

// if (result.map) {
//   console.log(JSON.stringify(result.map, null, 2));
// } else {
//   console.log('No table of contents available');
// }

console.log(JSON.stringify(result.map, null, 2));

function remarkToc() {
  return function (tree) {
    const result = toc(tree, {
      heading: '(table[ -]of[ -])?contents?|toc',
    });

    if (
      result.endIndex === undefined ||
      result.endIndex === -1 ||
      result.index === undefined ||
      result.index === -1 ||
      !result.map
    ) {
      return;
    }

    tree.children = [
      // ...tree.children.slice(0, result.index),
      result.map,
      // ...tree.children.slice(result.endIndex),
    ];
  };
}

const html = await unified()
  .use(markdown)
  .use(remarkToc)
  .use(remarkRehype)
  .use(rehypeStringify)
  .process(markdownContent);

// console.log(html);
