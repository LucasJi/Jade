export interface TreeViewNode {
  name: string;
  path: string;
  vaultPath: string;
  children: TreeViewNode[];
  isDir: boolean;
}

export interface TreeViewProps {
  className?: string;
}
