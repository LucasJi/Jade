// "#"
export const MD_TITLE_REG = /^#\s+.+/;

// "#", "##", "###", "####", "#####", "######"
export const MD_HEADING_REG = /^(#{1,6})\s+.+/;

export const MD_EXT_REG = /\.md$/;

export const MD_EXT = 'md';

export const OB_COMMENT_REG = new RegExp(/[^`]?%%(.*?)%%[^`]?/g);

// Redis keys
export enum RK {
  ALL = 'jade-test:*',
  PATHS = 'jade-test:paths:',
  OBJS = 'jade-test:objs',
  HEADING = 'jade-test:heading:',
  FRONT_MATTER = 'jade-test:frontmatter:',
  HAST = 'jade-test:hast:',
  HAST_CHILD = 'jade-test:hChld:',
  IDX_HAST_CHILD = 'jade-test:idx:hChld',
  IDX_FRONT_MATTER = 'jade-test:idx:frontmatter',
  GRAPH = 'jade-test:graph',
  HOME = 'jade-test:home',
  MD5 = 'jade-test:md5:',
  FILES = 'jade-test:files',
}

// accepted file formats
export const MD_EXTS = [MD_EXT];
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
export const AUDIO_EXTS = ['flac', 'm4a', 'mp3', 'ogg', 'wav', 'webm', '3gp'];
export const VIDEO_EXTS = ['mkv', 'mov', 'mp4', 'ogv', 'webm'];
export const PDF_EXTS = ['pdf'];
export const ACCEPTED_FILE_FORMATS = [...MD_EXTS];
