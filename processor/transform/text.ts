import { OB_COMMENT_REG } from '@/lib/constants';

/**
 * Remove comments(text wrapped with %%) from obsidian note
 */
export const transformObComment = (note: string): string => {
  return note.replaceAll(OB_COMMENT_REG, '');
};
