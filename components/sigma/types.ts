export interface NodeData {
  key: string;
  label: string;
  tags: string[];
  targets: string[];
  x: number;
  y: number;
}

export interface Tag {
  key: string;
}

export interface Dataset {
  nodes: NodeData[];
  edges: [string, string][];
  tags: Tag[];
}

export interface FiltersState {
  tags: Record<string, boolean>;
}
