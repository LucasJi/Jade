import { create, StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';

const middleware = (f: StateCreator<StoreState>) => devtools(f);

interface StoreState {}

const useStarryStore = create<StoreState>()(middleware(set => ({})));
export default useStarryStore;
