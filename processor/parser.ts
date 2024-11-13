import { transformNoteToAst } from '@/processor/transformer/ast';
import { transformUrls } from '@/processor/transformer/hast';
import { transformObComment } from '@/processor/transformer/text';
import { NoteParserOptions } from '@/processor/types';

export const parseNote = (options: NoteParserOptions) => {
  const trdNote = transformObComment(options.note);
  const { mdast, hast, frontmatter } = transformNoteToAst({
    note: trdNote,
  });
  transformUrls(hast);
  // transformTitle(mdast);
};
