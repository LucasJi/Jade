import { join } from 'path';

// path separator
export const SEPARATOR = '/';

// find markdown mark "#"
export const MD_TITLE_REG = /^#\s+.+/;

// find markdown file "xxx.md"
export const MD_SUFFIX_REG = /\.md$/;

// find markdown heading marks: "#", "##", "###", "####", "#####", "######"
export const MD_HEADING_REG = /^(#{1,6})\s+.+/;

export const POST_DIR = join(process.cwd(), '_posts', SEPARATOR);
