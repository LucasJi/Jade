import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import { read } from 'to-vfile';

const filepath = '_posts/Aliases/Add an alias to a note.md';

const processor = remark().use(remarkFrontmatter, ['yaml']);

const post = await read(filepath);

const file = processor.processSync(post);

console.log(file);
