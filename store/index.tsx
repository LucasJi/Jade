import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { NodeProps } from '@types';
import { Vector3 } from 'three';

const middleware = (f: StateCreator<StoreState>) => devtools(f);

// TODO: migrate to post entities
const nodes = [
  {
    name: 'a',
    position: new Vector3(0, 0, 0),
    connectedTo: [new Vector3(2, -3, 0)],
    color: '#204090',
  },
  {
    name: 'b',
    position: new Vector3(2, -3, 0),
    color: '#904020',
    connectedTo: [],
  },
];

interface StoreState {
  nodes: NodeProps[];
  updateNodePos: (name: string, pos: Vector3) => void;
}

const useStore = create<StoreState>()(
  middleware(set => ({
    nodes,
    updateNodePos: (name: string, pos: Vector3) =>
      set(({ nodes }) => {
        const toBeUpdated = nodes.find(n => n.name === name);
        if (toBeUpdated) {
          toBeUpdated.position = pos;
        }
        return { nodes: [...nodes] };
      }),
  })),
);
export default useStore;
