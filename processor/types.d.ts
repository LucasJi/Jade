import { Root as HastRoot, Nodes } from 'hast';
import { ListItem, Root } from 'mdast';

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
};

export interface NoteParserResult {
  mdast: Root;
  hast: HastRoot;
  frontmatter: Transformer.FrontMatter;
  headings: ListItem[];
  internalLinkTargets: string[];
}
