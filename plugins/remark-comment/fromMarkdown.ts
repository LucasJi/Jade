import type {
  Extension as FromMarkdownExtension,
  Handle,
} from 'mdast-util-from-markdown';

export const fromMarkdown = (): FromMarkdownExtension => {
  const enterComment: Handle = function (token) {
    this.enter(
      {
        type: 'comment',
        children: [],
        data: {
          hName: 'div',
          hProperties: {
            className: 'hidden',
          },
        },
      },
      token,
    );
  };

  const exitComment: Handle = function (token) {
    this.exit(token);
  };

  return {
    canContainEols: ['comment'],
    enter: {
      comment: enterComment,
    },
    exit: {
      comment: exitComment,
    },
  };
};
