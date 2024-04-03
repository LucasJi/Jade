// import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkParseFrontmatter from 'remark-parse-frontmatter';
// import remarkRehype from 'remark-rehype';
import remarkStringify from 'remark-stringify';
import { read } from 'to-vfile';
import { unified } from 'unified';
// import { remarkWikilink } from '../lib/remark-wikilink/index.js';

const filepath1 = '_posts/tech/java/jdk21.md';
const filepath2 = '/Users/lucas/Projects/docs/index.md';

const processor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkParseFrontmatter)
  // .use(remarkWikilink)
  .use(remarkStringify);
// .use(remarkRehype)
// .use(rehypeStringify);

const post = await read(filepath1);

const file = processor.processSync(post);
const root = processor.parse(post);

// console.log(file);
// console.log(root);
console.log(processor.stringify(root));

// unified()
//   .use(remarkParse) // Parse markdown content to a syntax tree
//   .use(remarkRehype) // Turn markdown syntax tree to HTML syntax tree, ignoring embedded HTML
//   .use(rehypeStringify) // Serialize HTML syntax tree
//   .process(post)
//   .then(file => console.log(''))
//   .catch(error => {
//     throw error;
//   });
