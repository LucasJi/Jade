import * as d3 from 'd3';

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

export type NoteGraphNode = d3.SimulationNodeDatum & Note;

export type NoteGraphLink = d3.SimulationLinkDatum<NoteGraphNode>;

export type NoteGraph = {
  nodes: NoteGraphNode[];
  links: NoteGraphLink[];
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

export type PathItemType = 'file' | 'dir';

export interface PathItem {
  id: string;
  path: string;
  type: PathItemType;
  ext: string;
}
