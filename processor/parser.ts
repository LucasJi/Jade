import { transformMdastToHast } from '@/processor/transformer/hast';
import {
  transformFrontmatterToSection,
  transformMdastToHeadings,
  transformSubHeadings,
  transformTitle,
  transformVFileToMdast,
} from '@/processor/transformer/mdast';
import {
  transformNoteToVFile,
  transformVFileToFrontmatter,
} from '@/processor/transformer/vFile';
import { NoteParserOptions } from '@/processor/types';
import { Root } from 'mdast';
import { removePosition } from 'unist-util-remove-position';
import { VFile } from 'vfile';

const transformText = (note: string) => {
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
  const { plainNoteName = '', subHeadings } = options;
  let { note } = options;

  // text transformers
  note = transformText(note);

  // v-file transformers
  const { vFile, frontmatter } = transformVFile(note);

  // mdast transformers
  const { mdast, headings } = transformMdast(vFile, frontmatter, plainNoteName);
  if (subHeadings) {
    transformSubHeadings(mdast, subHeadings);
  }

  transformFrontmatterToSection(mdast, frontmatter);

  // hast transformers
  const hast = transformHast(mdast, vFile);
  removePosition(hast, { force: true });

  return {
    mdast,
    hast,
    frontmatter,
    headings,
  };
};
