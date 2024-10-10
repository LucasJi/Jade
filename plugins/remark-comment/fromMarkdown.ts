import type {
  Extension as FromMarkdownExtension,
  Handle,
} from 'mdast-util-from-markdown';

export const fromMarkdown = (): FromMarkdownExtension => {
  const enterComment: Handle = function (token) {
    this.enter(
      {
        type: 'paragraph',
        children: [],
        data: {
          hName: 'div',
        },
      },
      token,
    );
  };

  const exitComment: Handle = function (token) {
    this.exit(token);
  };

  return {
    canContainEols: ['paragraph'],
    enter: {
      comment: enterComment,
    },
    exit: {
      comment: exitComment,
    },
  };
};
