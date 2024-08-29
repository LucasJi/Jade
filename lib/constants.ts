import { posix, sep } from 'path';
import { env } from './env';

export const SEP = env.dir.root ? sep : posix.sep;

// "#"
export const MD_TITLE_REG = /^#\s+.+/;

export const MD_EXT_REG = /\.md$/;

export const MD_EXT = '.md';

// "#", "##", "###", "####", "#####", "######"
export const MD_HEADING_REG = /^(#{1,6})\s+.+/;

// redis keys
export const IDS = 'jade:posts:ids';
export const POST_ID = 'jade:posts:id:';
export const POSTS_TREE = 'jade:posts:tree';
export const POST_PATH = 'jade:posts:path:';
