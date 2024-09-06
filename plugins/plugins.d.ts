import { Node, Parent, PhrasingContent } from 'mdast';

export interface InlineMark extends Parent {
  type: 'mark';
  children: PhrasingContent[];
}

export interface Wikilink extends Node {
  type: 'wikilink';
  value: string | null;
  data: {
    alias: string | null;
    permalink: string | null;
    exists: boolean | null;
  };
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
  }
}

declare module 'mdast-util-to-markdown' {
  interface ConstructNameMap {
    highlight: 'highlight';
  }
}

declare module 'mdast' {
  interface RootContentMap {
    inlineMark: InlineMark;
    wikilink: Wikilink;
  }
}
