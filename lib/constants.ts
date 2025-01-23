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
  // set
  PATHS = 'jade-test:paths',
  // hast
  FILES = 'jade-test:files',
  // TODO: deprecated
  OBJS = 'jade-test:objs',
  // string
  HEADING = 'jade-test:heading:',
  // set
  FRONT_MATTER = 'jade-test:frontmatter:',
  // json
  HAST = 'jade-test:hast:',
  // json
  HAST_CHILD = 'jade-test:hChld:',
  // idx
  IDX_HAST_CHILD = 'jade-test:idx:hChld',
  // idx
  IDX_FRONT_MATTER = 'jade-test:idx:frontmatter',
  // json
  GRAPH = 'jade-test:graph',
  // string
  HOME = 'jade-test:home',
  // json
  TREE_VIEW = 'jade-test:tree-view',
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
