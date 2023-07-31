import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';
import { PostMap } from '@types';
import { Vector3 } from 'three';

const middleware = (f: StateCreator<StoreState>) => devtools(f);

interface StoreState {
  updatePostPos: (name: string, pos: Vector3) => void;
  postMap: PostMap;
  initPostMap: (initPostMap: PostMap) => void;
}

const useStarryStore = create<StoreState>()(
  middleware(set => ({
    updatePostPos: (name: string, pos: Vector3) =>
      set(({ postMap }) => {
        return {
          postMap: { ...postMap, [name]: { ...postMap[name], position: pos } },
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
