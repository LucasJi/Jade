import { Node, Parent, PhrasingContent } from 'mdast';

export interface InlineMark extends Parent {
  type: 'mark';
  children: PhrasingContent[];
}

export interface Wikilink extends Node {
  type: 'wikilink';
  value: string | null;
  data: {
    alias?: string;
    exists?: boolean;
  };
}

export interface EmbedFile extends Node {
  type: 'embedFile';
  filename: string;
}

declare module 'mdast' {
  interface RootContentMap {
    inlineMark: InlineMark;
    wikilink: Wikilink;
    embedFile: EmbedFile;
  }
}

declare module 'micromark-util-types' {
  interface TokenTypeMap {
    // remark-highlight
    highlight: 'highlight';
    highlightSequenceTemporary: 'highlightSequenceTemporary';
    highlightSequence: 'highlightSequence';
    highlightText: 'highlightText';

    // remark-task-list
    taskListCheck: 'taskListCheck';
    taskListCheckMarker: 'taskListCheckMarker';
    taskListCheckValueChecked: 'taskListCheckValueChecked';
    taskListCheckValueUnchecked: 'taskListCheckValueUnchecked';

    // remark-wikilink
    wikilink: 'wikilink';
    wikilinkMarker: 'wikilinkMarker';
    wikilinkData: 'wikilinkData';
    wikilinkTarget: 'wikilinkTarget';
    wikilinkAlias: 'wikilinkAlias';
    wikilinkAliasMarker: 'wikilinkAliasMarker';

    // remark-comment
    comment: 'comment';
    commentMarker: 'commentMarker';

    // remark-embed-files
    embedFile: 'embedFile';
    embedFileName: 'embedFileName';
    embedFileEndMarker: 'embedFileEndMarker';
  }
}

declare module 'mdast-util-to-markdown' {
  interface ConstructNameMap {
    highlight: 'highlight';
  }
}
