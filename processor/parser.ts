import { transformMdastToHast } from '@/processor/transformer/hast';
import {
  transformMdastToHeadings,
  transformTitle,
  transformVFileToMdast,
} from '@/processor/transformer/mdast';
import {
  transformNoteToVFile,
  transformVFileToFrontmatter,
} from '@/processor/transformer/vFile';
import { NoteParserOptions } from '@/processor/types';
import { Root } from 'mdast';
import { VFile } from 'vfile';

const transformText = (note: string) => {
  // return transformObComment(note);
  return note;
};

const transformVFile = (note: string) => {
  const vFile = transformNoteToVFile(note);
  const frontmatter = transformVFileToFrontmatter(vFile);

  return {
    vFile,
    frontmatter,
  };
};

const transformMdast = (
  vFile: VFile,
  frontmatter: Record<any, any>,
  noteFilename: string,
) => {
  const mdast = transformVFileToMdast(vFile);
  transformTitle(mdast, frontmatter, noteFilename);
  const headings = transformMdastToHeadings(mdast);

  return {
    mdast,
    headings,
  };
};

const transformHast = (mdast: Root, vFile: VFile) => {
  return transformMdastToHast(mdast, vFile);
};

export const parseNote = (options: NoteParserOptions) => {
  const { plainNoteName = '' } = options;
  let { note } = options;

  note = transformText(note);
  const { vFile, frontmatter } = transformVFile(note);
  const { mdast, headings } = transformMdast(vFile, frontmatter, plainNoteName);
  const hast = transformHast(mdast, vFile);

  return {
    mdast,
    hast,
    frontmatter,
    headings,
  };
};
