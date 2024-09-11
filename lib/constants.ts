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
export const RK_IDS = 'jade:ids';
export const RK_TREE = 'jade:tree';
export const RK_ID_NOTE = 'jade:note:';
export const RK_NOTE_PATH_ID = 'jade:note.path:';
export const RK_ID_PATH = 'jade:path:';

// accepted file formats
const MD_FORMATS = [MD_EXT];
export const PIC_FORMATS = [
  '.avif',
  '.bmp',
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.webp',
];
const audioFormats = ['.flac', '.m4a', '.mp3', '.ogg', '.wav', '.webm', '.3gp'];
const videoFormats = ['.mkv', '.mov', '.mp4', '.ogv', '.webm'];
const pdfFormats = ['.pdf'];
export const ACCEPTED_FILE_FORMATS = [...MD_FORMATS, ...PIC_FORMATS];
