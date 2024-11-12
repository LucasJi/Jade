import { Node } from 'unist-util-visit';
import { VFile } from 'vfile';
import { matter } from 'vfile-matter';

// convert frontmatter to metadata, see: https://github.com/remarkjs/remark-frontmatter?tab=readme-ov-file#example-frontmatter-as-metadata
export const frontYamlMatterHandler = () => {
  return function (tree: Node, file: VFile) {
    matter(file, { strip: true });
  };
};
