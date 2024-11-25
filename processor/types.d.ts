import { Nodes } from 'hast';
import { Root } from 'mdast';

export declare namespace Transformer {
  type FrontMatter = Record<string, any>;
  type NoteToAstOptions = {
    /**
     * Markdown.
     */
    note?: string | null | undefined;
  };
  type NoteToAstResults = {
    mdast: Root;
    hast: Nodes;
    frontmatter: FrontMatter;
  };
}

export type NoteParserOptions = {
  plainNoteName?: string;
  note: string;
  subHeadings?: string[];
};
