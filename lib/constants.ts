import { posix, sep } from 'path';
import { env } from './env';

export const SEP = env.dir.root ? sep : posix.sep;

// "#"
export const MD_TITLE_REG = /^#\s+.+/;

// "#", "##", "###", "####", "#####", "######"
export const MD_HEADING_REG = /^(#{1,6})\s+.+/;

export const MD_EXT_REG = /\.md$/;

export const MD_EXT = '.md';

// redis keys
export const IDS = 'jade:posts:ids';
export const POST_ID = 'jade:posts:id:';
export const POSTS_TREE = 'jade:posts:tree';
export const POST_PATH = 'jade:posts:path:';

// accepted file formats
const mdFormats = ['md'];
const picFormats = ['avif', 'bmp', 'gif', 'jpeg', 'jpg', 'png', 'svg', 'webp'];
const audioFormats = ['flac', 'm4a', 'mp3', 'ogg', 'wav', 'webm', '3gp'];
const videoFormats = ['mkv', 'mov', 'mp4', 'ogv', 'webm'];
const pdfFormats = ['pdf'];
export const ACCEPTED_FILE_FORMATS = [
  ...mdFormats,
  ...pdfFormats,
  ...audioFormats,
  ...videoFormats,
  ...picFormats,
];
