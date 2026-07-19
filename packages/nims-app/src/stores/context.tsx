import { createContext, useContext } from 'react';
import { RootStore } from './RootStore';

const rootStore = new RootStore();
const RootStoreContext = createContext<RootStore>(rootStore);

export function RootStoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <RootStoreContext.Provider value={rootStore}>
      {children}
    </RootStoreContext.Provider>
  );
}

export function useRootStore(): RootStore {
  return useContext(RootStoreContext);
}
