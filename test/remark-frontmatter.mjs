import rehypeStringify from 'rehype-stringify';
import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import remarkRehype from 'remark-rehype';
import { read } from 'to-vfile';
import { matter } from 'vfile-matter';

function myUnifiedPluginHandlingYamlMatter() {
  /**
   * Transform.
   *
   * @param {Node} tree
   *   Tree.
   * @param {VFile} file
   *   File.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree, file) {
    matter(file);
  };
}

const filepath = '_posts/Aliases/Add an alias to a note.md';

const processor = remark()
  .use(remarkFrontmatter, ['yaml'])
  .use(myUnifiedPluginHandlingYamlMatter);

const post = await read(filepath);

const file = processor.processSync(post);
const root = processor.parse(post);

// console.log(file);
// console.log(file.data.matter.aliases);
// console.log(root);

const rehypeProcessor = remark()
  .use(remarkFrontmatter, ['yaml'])
  .use(myUnifiedPluginHandlingYamlMatter)
  .use(remarkRehype)
  .use(rehypeStringify);

const html = rehypeProcessor.process(post);
console.log(html);
