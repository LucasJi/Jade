import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import remarkStringify from 'remark-stringify';
import { read } from 'to-vfile';
import remarkGalaxy from '../lib/remark-galaxy/index.js';
import { remarkWikilink } from '../lib/remark-wikilink/index.js';

const filepath = '_posts/Aliases/Add an alias to a note.md';

const processor = remark()
  .use(remarkWikilink)
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkGalaxy, { title: 'Test Title' })
  .use(remarkStringify);
// .use(remarkRehype)
// .use(rehypeStringify);

const post = await read(filepath);

const file = processor.processSync(post);
const root = processor.parse(post);

console.log(file);
// console.log('root', root);
