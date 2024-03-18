import * as d3 from 'd3';

export type Slug = string[];

export interface Post {
  wikilink: string;
  slug: Slug;
  slugIdx?: number;
  content: string;
  title: string;
  forwardLinks: string[];
  backlinks: string[];
  href: string;
}

export type PostGraphNode = d3.SimulationNodeDatum & Post;

export type PostGraphLink = d3.SimulationLinkDatum<PostGraphNode>;

export type PostGraph = {
  nodes: PostGraphNode[];
  links: PostGraphLink[];
};

export type PostTreeNode = {
  id: string;
  name: string;
  children?: PostTreeNode[];
};

export type PostTree = PostTreeNode[];

export interface TreeNode {
  id: number;
  name: string;
  children?: TreeNode[];
}

export interface TreeProps {
  data: TreeNode[];
}
