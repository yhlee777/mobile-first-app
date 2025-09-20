import { create } from 'zustand';

interface LoadingStore {
  loadingStates: Map<string, boolean>;
  setLoading: (key: string, value: boolean) => void;
  isLoading: (key: string) => boolean;
}

export const useLoadingStore = create<LoadingStore>((set, get) => ({
  loadingStates: new Map(),
  setLoading: (key, value) => {
    const states = new Map(get().loadingStates);
    states.set(key, value);
    set({ loadingStates: states });
  },
  isLoading: (key) => get().loadingStates.get(key) || false,
}));