import remarkFrontmatter from 'remark-frontmatter';
import { read } from 'to-vfile';
import { remark } from 'remark';
import remarkParseFrontmatter from 'remark-parse-frontmatter';

const filepath1 = '_posts/tech/java/jdk21.md';
const filepath2 = '/Users/lucas/Projects/docs/index.md';

const processor = remark()
  .use(remarkFrontmatter, ['yaml', 'toml'])
  .use(remarkParseFrontmatter)
  .use(remarkFrontmatter, ['yaml', 'toml']);
// .use(myUnifiedPluginHandlingYamlMatter);
// .use(function () {
//   return function (tree) {
//     console.dir(tree);
//   };
// })
const file = processor.processSync(await read('_posts/tech/java/jdk21.md'));

console.log(file);
