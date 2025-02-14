// "#"
export const MD_TITLE_REG = /^#\s+.+/;

// "#", "##", "###", "####", "#####", "######"
export const MD_HEADING_REG = /^(#{1,6})\s+.+/;

export const MD_EXT_REG = /\.md$/;

export const OB_COMMENT_REG = new RegExp(/[^`]?%%(.*?)%%[^`]?/g);

// Redis keys
export enum RK {
  // set
  PATHS = 'jade:paths',
  // hast
  FILES = 'jade:files',
  // string
  HEADING = 'jade:heading:',
  // set
  FRONT_MATTER = 'jade:frontmatter:',
  // json
  HAST = 'jade:hast:',
  // json
  HAST_CHILD = 'jade:hChld:',
  // idx
  IDX_HAST_CHILD = 'jade:idx:hChld',
  // idx
  IDX_FRONT_MATTER = 'jade:idx:frontmatter',
  // json
  GRAPH = 'jade:graph',
  // string
  HOME = 'jade:home',
  // json
  TREE_VIEW = 'jade:tree-view',
  // string
  PATH_MAPPING = 'jade:path-mapping:',
}

// allowed file types
export enum FileType {
  // markdown
  MD = 'md',

  // images
  AVIF = 'avif',
  BMP = 'bmp',
  GIF = 'gif',
  JPEG = 'jpeg',
  JPG = 'jpg',
  PNG = 'png',
  SVG = 'svg',
  WEBP = 'webp',

  // audios
  FLAC = 'flac',
  M4A = 'm4a',
  MP3 = 'mp3',
  OGG = 'ogg',
  WAV = 'wav',
  THREE_GP = '3gp',

  // videos
  MKV = 'mkv',
  MOV = 'mov',
  MP4 = 'mp4',
  OGV = 'ogv',
  WEBM = 'webm',

  // pdf
  PDF = 'pdf',
}

export const MD_EXTS = [FileType.MD];
export const IMAGE_EXTS = [
  FileType.AVIF,
  FileType.BMP,
  FileType.GIF,
  FileType.JPEG,
  FileType.JPG,
  FileType.PNG,
  FileType.SVG,
  FileType.WEBP,
];
export const AUDIO_EXTS = [
  FileType.FLAC,
  FileType.M4A,
  FileType.MP3,
  FileType.OGG,
  FileType.WAV,
  FileType.WEBM,
  FileType.THREE_GP,
];
export const VIDEO_EXTS = [
  FileType.MKV,
  FileType.MOV,
  FileType.MP4,
  FileType.OGV,
  FileType.WEBM,
];
export const PDF_EXTS = [FileType.PDF];

export const MIME: { [key in FileType]: string } = {
  [FileType.MD]: 'text/markdown',
  [FileType.AVIF]: 'image/avif',
  [FileType.BMP]: 'image/bmp',
  [FileType.GIF]: 'image/gif',
  [FileType.JPEG]: 'image/jpeg',
  [FileType.JPG]: 'image/jpeg',
  [FileType.PNG]: 'image/png',
  [FileType.SVG]: 'image/svg+xml',
  [FileType.WEBP]: 'image/webp',
  [FileType.FLAC]: 'audio/flac',
  [FileType.M4A]: 'audio/m4a',
  [FileType.MP3]: 'audio/mpeg',
  [FileType.OGG]: 'audio/ogg',
  [FileType.WAV]: 'audio/wav',
  [FileType.THREE_GP]: 'audio/3gpp',
  [FileType.MKV]: 'video/x-matroska',
  [FileType.MOV]: 'video/quicktime',
  [FileType.MP4]: 'video/mp4',
  [FileType.OGV]: 'video/ogg',
  [FileType.WEBM]: 'video/webm',
  [FileType.PDF]: 'application/pdf',
};
