import { read } from 'to-vfile';
import wikiLinkPlugin from '@portaljs/remark-wiki-link';
import { remark } from 'remark';

const filepath1 = '_posts/tech/java/jdk21.md';
const filepath2 = '/Users/lucas/Projects/docs/index.md';

const processor = remark().use(wikiLinkPlugin);
// .use(remarkStringify);

const post = await read(filepath1);

const file = processor.parse(post);
// const root = processor.parse(post);

console.log(file);
// console.log('root', root);
