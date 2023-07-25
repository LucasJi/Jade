import { Mesh, Vector3 } from 'three';
import { MeshBasicMaterialProps } from '@react-three/fiber';
import { ReactNode } from 'react';

export type Slug = string[];

export type Post = {
  wikilink: string;
  slug: Slug;
  content: string;
  title: string;
  forwardWikilinks: string[];
  backlinks: string[];
  href: string;
};

export type CircleProps = {
  children?: ReactNode;
  color?: MeshBasicMaterialProps['color'];
  opacity?: MeshBasicMaterialProps['opacity'];
  radius?: number;
  segments?: number;
} & Partial<Pick<Mesh, 'onPointerOut', 'onPointerOver'>>;

export type NodeProps = {
  name: string;
  color?: MeshBasicMaterialProps['color'];
  connectedTo: Vector3[];
  position: Vector3;
};

export type Line = {
  start: Vector3;
  end: Vector3;
};

export type NodeMap = {
  [name: string]: {
    color: MeshBasicMaterialProps['color'];
    connectedTo: string[];
    position: Vector3;
  };
};
