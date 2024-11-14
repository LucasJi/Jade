import { transformMdastToHast } from '@/processor/transformer/hast';
import {
  transformMdastToHeadings,
  transformTitle,
  transformVFileToMdast,
} from '@/processor/transformer/mdast';
import { transformObComment } from '@/processor/transformer/text';
import {
  transformNoteToVFile,
  transformVFileToFrontmatter,
} from '@/processor/transformer/vFile';
import { NoteParserOptions } from '@/processor/types';

export const parseNote = (options: NoteParserOptions) => {
  const { noteFilename = '' } = options;
  let { note } = options;

  // text transformers
  note = transformObComment(note);

  // v-file transformers
  const vFile = transformNoteToVFile(note);
  const frontmatter = transformVFileToFrontmatter(vFile);

  // mdast transformers
  const mdast = transformVFileToMdast(vFile);
  transformTitle(mdast, frontmatter, noteFilename);
  const headings = transformMdastToHeadings(mdast);

  // hast transformers
  const hast = transformMdastToHast(mdast, vFile);

  return {
    mdast,
    hast,
    frontmatter,
    headings,
  };
};
