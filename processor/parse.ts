import { transformNoteToAst } from '@/processor/transform/ast';
import { transformObComment } from '@/processor/transform/text';
import { NoteParserOptions } from '@/processor/types';

export const parseNote = (options: NoteParserOptions) => {
  const trdNote = transformObComment(options.note);
  transformNoteToAst({ note: trdNote });
};
