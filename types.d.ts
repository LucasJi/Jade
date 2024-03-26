import * as d3 from 'd3';

export interface Post {
  wikilink: string;
  relativePath: string;
  content: string;
  title: string;
  forwardLinks: string[];
  backlinks: string[];
}

export type PostGraphNode = d3.SimulationNodeDatum & Post;

export type PostGraphLink = d3.SimulationLinkDatum<PostGraphNode>;

export type PostGraph = {
  nodes: PostGraphNode[];
  links: PostGraphLink[];
};

export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

export interface TreeProps {
  data: TreeNode[];
}
