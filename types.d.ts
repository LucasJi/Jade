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

export interface TreeViewNode {
  name: string;
  path: string;
  children: TreeViewNode[];
  isDir: boolean;
}

export interface TreeViewProps {
  className?: string;
}

export type NoteObjectType = 'file' | 'dir';

export interface NoteObject {
  name: string;
  type: NoteObjectType;
  ext: string;
}

export interface BucketItem {
  name: string;
  size: number;
  etag: string;
  prefix?: never;
  lastModified: Date;
  isLatest: boolean;
  isDeleteMarker: boolean;
}
