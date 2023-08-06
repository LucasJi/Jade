export type Slug = string[];

export type Post = {
  wikilink: string;
  slug: Slug;
  content: string;
  title: string;
  forwardWikilinks: string[];
  backlinks: string[];
  href: string;
};
