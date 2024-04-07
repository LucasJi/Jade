import remarkFrontmatter from 'remark-frontmatter';
import remarkStringify from 'remark-stringify';
import { read } from 'to-vfile';
import remarkGalaxy from '../lib/remark-galaxy/index.js';
import { remarkWikilink } from '../lib/remark-wikilink/index.js';
import { remark } from 'remark';

const filepath1 = '_posts/tech/java/jdk21.md';
const filepath2 = '/Users/lucas/Projects/docs/index.md';

const processor = remark()
  .use(remarkWikilink)
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkGalaxy, { title: 'Test Title' })
  .use(remarkStringify);
// .use(remarkRehype)
// .use(rehypeStringify);

const post = await read(filepath1);

// const file = processor.processSync(post);
const root = processor.parse(post);

// console.log(file);
console.log('root', root);
