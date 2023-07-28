import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { NodeMap, PostMap } from '@types';
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
    position: new Vector3(2.2836140246613965, 11.480502970952694, 0),
    color: '#904020',
    connectedTo: [],
  },
};

interface StoreState {
  nodeMap: NodeMap;
  updateNodePos: (name: string, pos: Vector3) => void;
  postMap: PostMap;
  initPostMap: (initPostMap: PostMap) => void;
}

const useStarryStore = create<StoreState>()(
  middleware(set => ({
    nodeMap,
    updateNodePos: (name: string, pos: Vector3) =>
      set(({ nodeMap }) => {
        return {
          nodeMap: { ...nodeMap, [name]: { ...nodeMap[name], position: pos } },
        };
      }),
    postMap: {},
    initPostMap: (initPostMap: PostMap) =>
      set(() => {
        return { postMap: initPostMap };
      }),
  })),
);
export default useStarryStore;
