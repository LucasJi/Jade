// "#"
export const MD_TITLE_REG = /^#\s+.+/;

// "#", "##", "###", "####", "#####", "######"
export const MD_HEADING_REG = /^(#{1,6})\s+.+/;

export const MD_EXT_REG = /\.md$/;

export const MD_EXT = 'md';

export const OB_COMMENT_REG = new RegExp(/[^`]?%%(.*?)%%[^`]?/g);

// Redis keys
export enum RK {
  PATHS = 'jade:paths:',
  OBJS = 'jade:objs',
  HEADING = 'jade:heading:',
  FRONT_MATTER = 'jade:frontmatter:',
  HAST = 'jade:hast:',
  HAST_CHILD = 'jade:hChld:',
  IDX_HAST_CHILD = 'jade:idx:hChld',
  IDX_FRONT_MATTER = 'jade:idx:frontmatter',
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
