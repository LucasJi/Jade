import { posix, sep } from 'path';

export const POST_HOME = process.env.POST_HOME || '';

export const SEP = POST_HOME ? sep : posix.sep;

// "#"
export const MD_TITLE_REG = /^#\s+.+/;

export const MD_EXT_REG = /\.md$/;

export const MD_EXT = '.md';

// "#", "##", "###", "####", "#####", "######"
export const MD_HEADING_REG = /^(#{1,6})\s+.+/;

export const IGNORED_DIRS = ['.git'];
