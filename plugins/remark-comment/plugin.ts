import { Options } from '@/plugins/remark-callout';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

export const remarkComment: Plugin<[Options?], Root> = () => {
  return (tree, _) => {};
};
