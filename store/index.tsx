import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { NodeMap } from '@types';
import { Vector3 } from 'three';

const middleware = (f: StateCreator<StoreState>) => devtools(f);

// TODO: migrate to post entities
const nodeMap: NodeMap = {
  a: {
    position: new Vector3(0, 0, 0),
    connectedTo: ['b'],
    color: '#204090',
  },
  b: {
    position: new Vector3(2, -3, 0),
    color: '#904020',
    connectedTo: [],
  },
};

interface StoreState {
  nodeMap: NodeMap;
  updateNodePos: (name: string, pos: Vector3) => void;
}

const useStore = create<StoreState>()(
  middleware(set => ({
    nodeMap,
    updateNodePos: (name: string, pos: Vector3) =>
      set(({ nodeMap }) => {
        return {
          nodeMap: { ...nodeMap, [name]: { ...nodeMap[name], position: pos } },
        };
      }),
  })),
);
export default useStore;
