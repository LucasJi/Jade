import hastTransformer from '@/processor/transformer/hast';
import mdastTransformer from '@/processor/transformer/mdast';
import textTransformer from '@/processor/transformer/text';
import vFileTransformer from '@/processor/transformer/vFile';
import { NoteParserOptions, NoteParserResult } from '@/processor/types';

export const noteParser = (options: NoteParserOptions): NoteParserResult => {
  const { plainNoteName = '' } = options;
  let { note } = options;

  note = textTransformer(note);

  const { vFile, frontmatter } = vFileTransformer(note);

  const { mdast, headings, internalLinkTargets } = mdastTransformer(
    vFile,
    frontmatter,
    plainNoteName,
  );

  const hast = hastTransformer(mdast, vFile);

  return {
    mdast,
    hast,
    frontmatter,
    headings,
    internalLinkTargets,
  };
};
