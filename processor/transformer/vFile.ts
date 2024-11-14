import { VFile } from 'vfile';
import { matter } from 'vfile-matter';

export const transformNoteToVFile = (note: string): VFile => {
  const file = new VFile();
  file.value = note;
  return file;
};

export const transformVFileToFrontmatter = (vFile: VFile) => {
  matter(vFile);
  const { matter: frontmatter } = vFile.data as any;
  return frontmatter ?? {};
};
