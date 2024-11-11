import { Element } from 'hast';
import { Components as JsxRuntimeComponents } from 'hast-util-to-jsx-runtime';
import { Options as RemarkRehypeOptions } from 'remark-rehype';

export type TextTransformer = (note: string) => string;

export type UrlTransformer = (
  url: string,
  key: string,
  node: Readonly<Element>,
) => string | null | undefined;

export type Components = Partial<JsxRuntimeComponents>;

export type Options = {
  /**
   * Markdown.
   */
  note?: string | null | undefined;
  /**
   * Wrap in a `div` with this class name.
   */
  className?: string | null | undefined;
  /**
   * List of rehype plugins to use.
   */
  rehypePlugins?: import('unified').PluggableList | null | undefined;
  /**
   * List of remark plugins to use.
   */
  remarkPlugins?: import('unified').PluggableList | null | undefined;
  /**
   * Options to pass through to `remark-rehype`.
   */
  remarkRehypeOptions?: Readonly<RemarkRehypeOptions> | null | undefined;
  /**
   * Ignore HTML in markdown completely (default: `false`).
   */
  skipHtml?: boolean | null | undefined;
  /**
   * Change URLs (default: `defaultUrlTransformer`)
   */
  urlTransformer?: UrlTransformer | null | undefined;
};
