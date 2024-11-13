import { VFile } from 'vfile';

export const transformNoteToVFile = (note: string): VFile => {
  const file = new VFile();
  file.value = note;
  return file;
};
