import { Data, Node, Parent, PhrasingContent } from 'mdast';

export interface InlineMark extends Parent {
  type: 'mark';
  children: PhrasingContent[];
}

interface WikilinkData extends Data {
  alias?: string;
  exists?: boolean;
}

export interface Wikilink extends Node {
  type: 'wikilink';
  value: string | null;
  data: WikilinkData;
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
    commentSequenceTemporary: 'commentSequenceTemporary';
    commentSequence: 'commentSequence';
    commentText: 'commentText';
    comment: 'comment';

    // remark-embed-files
    embedFile: 'embedFile';
    embedFileName: 'embedFileName';
    embedFileEndMarker: 'embedFileEndMarker';
  }
}

declare module 'mdast-util-to-markdown' {
  interface ConstructNameMap {
    highlight: 'highlight';
    comment: 'comment';
  }
}
