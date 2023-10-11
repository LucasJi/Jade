import { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';

export type Slug = string[];

export type Post = {
  wikilink: string;
  slug: Slug;
  slugIdx?: number;
  content: string;
  title: string;
  forwardLinks: string[];
  backlinks: string[];
  href: string;
};

export interface PostGraphNode extends SimulationNodeDatum, Post {}

export interface PostGraphLink extends SimulationLinkDatum<PostGraphNode> {}

export type PostGraph = {
  nodes: PostGraphNode[];
  links: PostGraphLink[];
};

export type PostTreeNode = {
  name: string;
  children?: PostTreeNode[];
};

export type PostTree = PostTreeNode[];
