import { Handle, HtmlExtension } from 'micromark-util-types';

export const html = (): HtmlExtension => {
  const enterComment: Handle = function () {
    this.tag('<div>');
  };

  const exitComment: Handle = function () {
    this.tag('</div>');
  };

  return {
    enter: {
      comment: enterComment,
    },
    exit: {
      comment: exitComment,
    },
  };
};
