import defu from 'defu';
import type { Properties } from 'hast';
import type {
  BlockContent,
  Blockquote,
  DefinitionContent,
  Paragraph,
  Root,
} from 'mdast';
import * as os from 'node:os';
import type { Plugin } from 'unified';
import { Node, visit } from 'unist-util-visit';

export type Options = {
  /**
   * The root node of the callout.
   *
   * @default
   * (callout) => ({
   *   tagName: callout.isFoldable ? "details" : "div",
   *   properties: {
   *     dataCallout: true,
   *     dataCalloutType: callout.type,
   *     open: callout.defaultFolded === undefined ? false : !callout.defaultFolded,
   *   },
   * })
   */
  root?: NodeOptions | ((callout: Callout) => NodeOptions);

  /**
   * The title node of the callout.
   *
   * @default
   * (callout) => ({
   *   tagName: callout.isFoldable ? "summary" : "div",
   *   properties: {
   *     dataCalloutTitle: true,
   *   },
   * })
   */
  title?: NodeOptions | ((callout: Callout) => NodeOptions);

  /**
   * The body node of the callout.
   *
   * @default
   * () => ({
   *   tagName: "div",
   *   properties: {
   *     dataCalloutBody: true,
   *   },
   * })
   */
  body?: NodeOptions | ((callout: Callout) => NodeOptions);
};

export type NodeOptions = {
  /**
   * The HTML tag name of the node.
   *
   * @see https://github.com/syntax-tree/hast?tab=readme-ov-file#element
   */
  tagName: string;

  /**
   * The HTML properties of the node.
   *
   * @see https://github.com/syntax-tree/hast?tab=readme-ov-file#properties
   * @see https://github.com/syntax-tree/hast?tab=readme-ov-file#element
   * @example { "className": "callout callout-info" }
   */
  properties: Properties;
};

export type Callout = {
  type: string;
  isFoldable: boolean;
  defaultFolded?: boolean;
  title?: string;
};

export type ExtractFunction<T> = Extract<T, (...args: any) => any>;

export type Callable<T> = {
  [P in keyof T]: ExtractFunction<T[P]> extends never
    ? T[P]
    : ExtractFunction<T[P]>;
};

export const defaultOptions: Required<Options> = {
  root: callout => ({
    tagName: 'div',
    properties: {
      dataCallout: true,
      dataCalloutType: formatForAttribute(callout.type),
      dataIsFoldable: callout.isFoldable,
      dataDefaultFolded:
        callout.defaultFolded === undefined ? false : !callout.defaultFolded,
    },
  }),
  title: callout => ({
    tagName: 'div',
    properties: {
      dataCalloutTitle: true,
      dataIsFoldable: callout.isFoldable,
      dataCalloutType: formatForAttribute(callout.type),
      dataDefaultFolded:
        callout.defaultFolded === undefined ? false : !callout.defaultFolded,
    },
  }),
  body: () => ({
    tagName: 'div',
    properties: {
      dataCalloutBody: true,
    },
  }),
};

const initOptions = (options?: Options) => {
  const defaultedOptions = defu(options, defaultOptions);

  return Object.fromEntries(
    Object.entries(defaultedOptions).map(([key, value]) => {
      if (
        ['root', 'title', 'titleInner', 'body'].includes(key) &&
        typeof value !== 'function'
      ) {
        return [key, () => value];
      }

      return [key, value];
    }),
  ) as Required<Callable<Options>>;
};

/**
 * A remark plugin to parse callout syntax.
 */
export const remarkCallout: Plugin<[Options?], Root> = _options => {
  const options = initOptions(_options);

  return (tree, file) => {
    visit(tree as Node, 'blockquote', (node: Blockquote) => {
      const paragraphNode = node.children.at(0);
      if (paragraphNode == null || paragraphNode.type !== 'paragraph') {
        console.debug('blockquote first child is not a paragraph', node);
        return;
      }

      // Skip if the first line is empty
      if (node.position?.start.line !== paragraphNode.position?.start.line) {
        console.debug('first line is empty');
        return;
      }

      const calloutTypeTextNode = paragraphNode.children.at(0);
      if (calloutTypeTextNode == null || calloutTypeTextNode.type !== 'text') {
        console.debug('invalid callout type node', calloutTypeTextNode);
        return;
      }

      // Parse callout syntax
      // e.g. "[!note] title"
      const [calloutTypeText, ...calloutBodyText] =
        calloutTypeTextNode.value.split(os.EOL);
      const calloutData = parseCallout(calloutTypeText);
      if (calloutData == null) {
        console.debug('cannot parse callout:', calloutTypeText);
        return;
      }

      // Generate callout root node
      node.data = {
        ...node.data,
        hName: options.root(calloutData).tagName,
        hProperties: {
          // @ts-ignore error TS2339: Property 'hProperties' does not exist on type 'BlockquoteData'.
          ...node.data?.hProperties,
          ...options.root(calloutData).properties,
        },
      };

      // Generate callout body node
      const bodyNode: (BlockContent | DefinitionContent)[] = [
        {
          type: 'paragraph',
          children: [],
        },
        ...node.children.splice(1),
      ];
      if (bodyNode[0].type !== 'paragraph') {
        return;
      } // type check
      if (calloutBodyText.length > 0) {
        bodyNode[0].children.push({
          type: 'text',
          value: calloutBodyText.join(os.EOL),
        });
      }

      // Generate callout title node
      const titleNode: Blockquote | Paragraph = {
        type: 'paragraph',
        data: {
          hName: options.title(calloutData).tagName,
          hProperties: {
            ...options.title(calloutData).properties,
          },
        },
        children: [],
      };

      if (calloutData.title != null) {
        titleNode.children.push({
          type: 'text',
          value: calloutData.title,
        });
      }
      if (calloutBodyText.length <= 0) {
        for (const [i, child] of paragraphNode.children.slice(1).entries()) {
          // Add all nodes after the break as callout body
          if (child.type === 'break') {
            titleNode.children.push(child); // Add the line break as callout title
            bodyNode[0].children.push(
              ...paragraphNode.children.slice(i + 1 + 1),
            ); // +1 for the callout type node, +1 for the break
            break;
          }

          // All inline node before the line break is added as callout title
          if (child.type !== 'text') {
            titleNode.children.push(child);
            continue;
          }

          // Add the part before the line break as callout title and the part after as callout body
          const [titleText, ...bodyTextLines] = child.value.split(os.EOL);
          if (titleText) {
            // Add the part before the line break as callout title
            titleNode.children.push({
              type: 'text',
              value: titleText,
            });
          }
          if (bodyTextLines.length > 0) {
            // Add the part after the line break as callout body
            if (bodyNode[0].type !== 'paragraph') {
              return;
            }
            bodyNode[0].children.push({
              type: 'text',
              value: bodyTextLines.join(os.EOL),
            });
            // Add all nodes after the current node as callout body
            bodyNode[0].children.push(...paragraphNode.children.slice(i + 2));
            break;
          }
        }
      } else {
        // Add all nodes after the current node as callout body
        bodyNode[0].children.push(...paragraphNode.children.slice(1));
      }

      // Add body and title to callout root node children
      node.children = [titleNode];
      if (bodyNode.length > 1 || bodyNode[0].children.length > 0) {
        node.children.push({
          type: 'blockquote',
          data: {
            hName: options.body(calloutData).tagName,
            hProperties: {
              ...options.body(calloutData).properties,
            },
          },
          children: bodyNode,
        });
      }
    });
  };
};

const capitalize = (word: string): string => {
  if (word.length === 0) {
    return word;
  }
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};

export const parseCallout = (
  text: string | null | undefined,
): Callout | undefined => {
  if (text == null) {
    return;
  }

  const match = text.match(
    /^\[!(?<type>[^\]]+)?\](?<isFoldable>[+-])?(?: (?<title>.*))?$/,
  );
  if (match?.groups?.type == null) {
    return undefined;
  }

  const callout: Callout = {
    type: match.groups.type,
    isFoldable: match.groups.isFoldable != null,
  };

  if (match.groups.isFoldable != null) {
    callout.defaultFolded = match.groups.isFoldable === '-';
  }

  if (match.groups.title != null) {
    callout.title = match.groups.title;
  } else {
    callout.title = capitalize(callout.type);
  }

  return callout;
};

export const formatForAttribute = (rawString: string) => {
  return rawString.replace(/\s+/g, '-').toLowerCase();
};
