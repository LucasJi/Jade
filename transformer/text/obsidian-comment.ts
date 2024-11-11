import { OB_COMMENT_REG } from '@/lib/constants';
import { TextTransformer } from '@/transformer/types';

/**
 * Remove comments(wrapped with %%) from obsidian note
 * @param note obsidian note
 */
export const obsidianCommentTextTransformer: TextTransformer = note => {
  return note.replaceAll(OB_COMMENT_REG, '');
};
