import type { Extension, Handle } from 'mdast-util-from-markdown';

const top = (stack: any) => {
  return stack[stack.length - 1];
};

const enterEmbedFile: Handle = function (token) {
  this.enter(
    {
      type: 'embedFile',
      filename: '',
      data: {
        hName: 'section',
        hProperties: { dataEmbedFile: true },
      },
    },
    token,
  );
};

const exitEmbedFile: Handle = function (node) {
  const embedFile = top(this.stack);

  if (!embedFile) {
    return;
  }

  // embedFile.data.hChildren = [
  //   {
  //     type: 'text',
  //     value: embedFile.filename,
  //   },
  // ];

  this.exit(node);
};

const exitEmbedFileName: Handle = function (node) {
  const filename = this.sliceSerialize(node);
  const current = top(this.stack);
  current.filename = filename;
};

export const fromMarkdown = (): Extension => {
  return {
    enter: {
      embedFile: enterEmbedFile,
    },
    exit: {
      embedFile: exitEmbedFile,
      embedFileName: exitEmbedFileName,
    },
  };
};
