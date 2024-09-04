import type {
  Extension as FromMarkdownExtension,
  Handle,
} from 'mdast-util-from-markdown';

export const fromMarkdown = (): FromMarkdownExtension => {
  const enterHighlight: Handle = function (token) {
    this.enter(
      {
        type: 'mark',
        children: [],
        data: {
          hName: 'mark',
        },
      },
      token,
    );
  };

  const exitHighlight: Handle = function (token) {
    this.exit(token);
  };
  return {
    canContainEols: ['mark'],
    enter: {
      highlight: enterHighlight,
    },
    exit: {
      highlight: exitHighlight,
    },
  };
};
