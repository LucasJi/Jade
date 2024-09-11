import * as d3 from 'd3';

export interface Post {
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

export type PostGraphNode = d3.SimulationNodeDatum & Post;

export type PostGraphLink = d3.SimulationLinkDatum<PostGraphNode>;

export type PostGraph = {
  nodes: PostGraphNode[];
  links: PostGraphLink[];
};

export interface TreeNode {
  id: string;
  name: string;
  children: TreeNode[];
  isDir: boolean;
}

export interface TreeProps {
  className?: string;
}

export interface PathItem {
  id: string;
  path: string;
  type: string;
  ext: string;
}
