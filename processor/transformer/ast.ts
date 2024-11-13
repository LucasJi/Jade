import { VFile } from 'vfile';
import { matter } from 'vfile-matter';

const parseFrontMatter = (vFile: VFile) => {
  matter(vFile);
  const { matter: frontmatter } = vFile.data as any;
  return frontmatter ?? {};
};
