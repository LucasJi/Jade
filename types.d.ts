import * as d3 from 'd3';
import { Redis } from 'ioredis';

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

export interface BucketItem {
  name: string;
  size: number;
  etag: string;
  prefix?: never;
  lastModified: Date;
  isLatest: boolean;
  isDeleteMarker: boolean;
}

declare global {
  namespace globalThis {
    // This will not work with let or const, you must use var.
    // eslint-disable-next-line no-var
    var redis: Redis;
  }
}
