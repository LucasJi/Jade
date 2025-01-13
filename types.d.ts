export interface Note {
  // base64Encode(path)
  id: string;
  content: string;
  title: string;
  frontmatter?: Frontmatter;
  // ids
  forwardLinks: string[];
  // ids
  backlinks: string[];
  // relative path
  path: string;
}

export type Frontmatter = undefined | { [key: string]: any };
