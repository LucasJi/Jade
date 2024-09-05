import type { Parent, PhrasingContent } from 'mdast';

export interface InlineMark extends Parent {
  type: 'mark';
  children: PhrasingContent[];
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
  }
}
