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

const post = await read('_posts/tech/java/jdk21.md');

const file = processor.processSync(post);
const root = processor.parse(post);

// console.log(file);
console.log(root.position);
