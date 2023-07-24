import { Mesh, Object3D, Vector3 } from 'three';
import { MeshBasicMaterialProps } from '@react-three/fiber';
import { Dispatch, ReactNode, RefObject, SetStateAction } from 'react';

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

export type Circle = {
  children?: ReactNode;
  color?: MeshBasicMaterialProps['color'];
  opacity?: MeshBasicMaterialProps['opacity'];
  radius?: number;
  segments?: number;
} & Partial<Pick<Mesh, 'onPointerOut', 'onPointerOver'>>;

export type NodeType = {
  set: Dispatch<
    SetStateAction<{ position: Vector3; connectedTo: RefObject<any>[] }[]>
  >;
  name: string;
  color?: MeshBasicMaterialProps['color'];
  connectedTo?: RefObject<Object3D>[];
  position?: Vector3;
};

export type NodePosProps = {
  position: Vector3;
  connectedTo: RefObject<Object3D>[];
};
