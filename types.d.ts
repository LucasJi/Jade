import * as d3 from 'd3';

export interface Post {
  // btoa(wikilink)
  id: string;
  // atob(id)
  wikilink: string;
  content: string;
  title: string;
  // ids
  forwardLinks: string[];
  // ids
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
