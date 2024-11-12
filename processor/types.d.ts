import { Nodes } from 'hast';
import { Components as JsxRuntimeComponents } from 'hast-util-to-jsx-runtime';
import { Root } from 'mdast';

export type Components = Partial<JsxRuntimeComponents>;

export declare namespace Transformer {
  type Matter = Record<string, any>;
  type NoteToAstOptions = {
    /**
     * Markdown.
     */
    note?: string | null | undefined;
  };
  type NoteToAstResults = {
    mdast: Root;
    hast: Nodes;
    matter: Matter;
  };
}

export type NoteParserOptions = {
  noteFilename?: string;
  note: string;
};
