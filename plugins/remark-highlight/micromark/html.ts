import { Handle, HtmlExtension } from 'micromark-util-types';

export const html = (): HtmlExtension => {
  const enterHighlight: Handle = function () {
    this.tag('<mark>');
  };

  const exitHighlight: Handle = function () {
    this.tag('</mark>');
  };

  return {
    enter: {
      highlight: enterHighlight,
    },
    exit: {
      highlight: exitHighlight,
    },
  };
};
