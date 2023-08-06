export type Slug = string[];

export type Post = {
  wikilink: string;
  slug: Slug;
  slugIdx?: number;
  content: string;
  title: string;
  forwardWikilinks: string[];
  backlinks: string[];
  href: string;
};

export type PostGraphLink = {
  source: string;
  target: string;
};

export type PostGraph = {
  nodes: Post[];
  links: PostGraphLink[];
};
