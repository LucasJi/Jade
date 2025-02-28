import type { Extension, Handle } from 'mdast-util-from-markdown';

const top = (stack: any) => {
  return stack[stack.length - 1];
};

const enterWikilink: Handle = function (token) {
  this.enter(
    {
      type: 'wikilink',
      value: null,
      data: {},
    },
    token,
  );
};

const exitWikilinkAlias: Handle = function (token) {
  const alias = this.sliceSerialize(token);
  const current = top(this.stack);
  current.data.alias = alias;
};

const exitWikilinkTarget: Handle = function (token) {
  const target = this.sliceSerialize(token);
  const current = top(this.stack);
  current.value = target;
};

const exitWikilink: Handle = function (node) {
  const wikilink = top(this.stack);

  if (!wikilink) {
    return;
  }

  const href = wikilink.value;
  const exists = href !== undefined;
  let displayName = wikilink.value;
  if (wikilink.data.alias) {
    displayName = wikilink.data.alias;
  }

  wikilink.data.alias = displayName;
  wikilink.data.exists = exists;

  wikilink.data.hName = 'a';

  wikilink.data.hProperties = {
    dataWikilink: true,
    href,
  };
  wikilink.data.hChildren = [
    {
      type: 'text',
      value: displayName,
    },
  ];

  this.exit(node);
};

export const fromMarkdown = (): Extension => {
  return {
    enter: {
      wikilink: enterWikilink,
    },
    exit: {
      wikilinkTarget: exitWikilinkTarget,
      wikilinkAlias: exitWikilinkAlias,
      wikilink: exitWikilink,
    },
  };
};
