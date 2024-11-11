import { posix, sep } from 'path';
import config from './config';

export const SEP = config.dir.root ? sep : posix.sep;

// "#"
export const MD_TITLE_REG = /^#\s+.+/;

// "#", "##", "###", "####", "#####", "######"
export const MD_HEADING_REG = /^(#{1,6})\s+.+/;

export const MD_EXT_REG = /\.md$/;

export const MD_EXT = 'md';

export const OB_COMMENT_REG = new RegExp(/%%[\s\S]*?%%/g);

// redis keys
export const RK_IDS = 'jade:ids';
export const RK_TREE = 'jade:tree';
export const RK_ID_NOTE = 'jade:note:';
export const RK_NOTE_PATH_ID = 'jade:note.path:';
export const RK_ID_PATH = 'jade:path:';
export const RK_HISTORY = 'jade:history';

// accepted file formats
const MD_EXTS = [MD_EXT];
export const IMAGE_EXTS = [
  'avif',
  'bmp',
  'gif',
  'jpeg',
  'jpg',
  'png',
  'svg',
  'webp',
];
const AUDIO_EXTS = ['flac', 'm4a', 'mp3', 'ogg', 'wav', 'webm', '3gp'];
const VIDEO_EXTS = ['mkv', 'mov', 'mp4', 'ogv', 'webm'];
const PDF_EXTS = ['pdf'];
export const ACCEPTED_FILE_FORMATS = [...MD_EXTS];
