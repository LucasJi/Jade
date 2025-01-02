import { VFile } from 'vfile';
import { matter } from 'vfile-matter';

export const convertNoteToVFile = (note: string): VFile => {
  const file = new VFile();
  file.value = note;
  return file;
};

const convertVFileToFrontmatter = (vFile: VFile) => {
  matter(vFile);
  const { matter: frontmatter } = vFile.data as any;
  return frontmatter ?? {};
};

const vFileTransformer = (note: string) => {
  const vFile = convertNoteToVFile(note);
  const frontmatter = convertVFileToFrontmatter(vFile);

  return {
    vFile,
    frontmatter,
  };
};

export default vFileTransformer;
