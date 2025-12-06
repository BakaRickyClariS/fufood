import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { useSharedLists } from '@/modules/planning/hooks/useSharedLists';

type SharedListsState = ReturnType<typeof useSharedLists>;

const SharedListsContext = createContext<SharedListsState | null>(null);

type SharedListsProviderProps = {
  value: SharedListsState;
  children: ReactNode;
};

export const SharedListsProvider = ({
  value,
  children,
}: SharedListsProviderProps) => (
  <SharedListsContext.Provider value={value}>
    {children}
  </SharedListsContext.Provider>
);

export const useSharedListsContext = () => {
  const context = useContext(SharedListsContext);
  if (!context) {
    throw new Error(
      'useSharedListsContext must be used within SharedListsProvider',
    );
  }
  return context;
};
