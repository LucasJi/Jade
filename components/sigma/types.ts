export interface NodeData {
  key: string;
  label: string;
  tag: string;
  URL: string;
  x: number;
  y: number;
}

export interface Tag {
  key: string;
  image: string;
}

export interface Dataset {
  nodes: NodeData[];
  edges: [string, string][];
  tags: Tag[];
}

export interface FiltersState {
  tags: Record<string, boolean>;
}
