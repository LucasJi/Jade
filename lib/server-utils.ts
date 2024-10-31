/* eslint-disable no-console */
import { matter } from 'vfile-matter';

// convert frontmatter to metadata, see: https://github.com/remarkjs/remark-frontmatter?tab=readme-ov-file#example-frontmatter-as-metadata
function frontYamlMatterHandler() {
  return function (tree: any, file: any) {
    matter(file, { strip: true });
  };
}
