import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParseFrontmatter from 'remark-parse-frontmatter';
import { read } from 'to-vfile';

const filepath1 = '_posts/tech/java/jdk21.md';
const filepath2 = '/Users/lucas/Projects/docs/index.md';

const processor = remark()
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkParseFrontmatter);

const post = await read(filepath1);

const file = processor.processSync(post);
const root = processor.parse(post);

// console.log(String(file));
console.log(root);
console.log(processor.compiler(root));

// unified()
//   .use(remarkParse) // Parse markdown content to a syntax tree
//   .use(remarkRehype) // Turn markdown syntax tree to HTML syntax tree, ignoring embedded HTML
//   // .use(remarkFrontmatter, ['yaml', 'toml'])
//   .use(rehypeStringify) // Serialize HTML syntax tree
//   .process(post)
//   .then(file => console.log(String(file)))
//   .catch(error => {
//     throw error;
//   });
