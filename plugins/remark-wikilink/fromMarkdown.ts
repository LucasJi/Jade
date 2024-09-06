import type { Extension, Handle } from 'mdast-util-from-markdown';

const permalinks: string[] = [];
const defaultPageResolver = (name: any) => [name];
const pageResolver = defaultPageResolver;
const wikilinkClassName = 'wikilink';
const defaultHrefTemplate = (permalink: string) => `${permalink}`;
const hrefTemplate = defaultHrefTemplate;

const top = (stack: any) => {
  return stack[stack.length - 1];
};

const enterWikilink: Handle = function (token) {
  this.enter(
    {
      type: 'wikilink',
      value: null,
      data: {
        alias: null,
        permalink: null,
        exists: null,
      },
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

  const pagePermalinks = pageResolver(wikilink.value);
  let permalink = pagePermalinks.find(p => permalinks.indexOf(p) !== -1);
  const exists = permalink !== undefined;
  if (!exists) {
    permalink = pagePermalinks[0];
  }
  let displayName = wikilink.value;
  if (wikilink.data.alias) {
    displayName = wikilink.data.alias;
  }

  const classNames = wikilinkClassName;
  // if (!exists) {
  //   classNames += ' ' + newClassName;
  // }

  wikilink.data.alias = displayName;
  wikilink.data.permalink = permalink;
  wikilink.data.exists = exists;

  wikilink.data.hName = 'a';
  const href = hrefTemplate(permalink);
  wikilink.data.hProperties = {
    className: classNames,
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
