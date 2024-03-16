'use client';

import { createContext, PropsWithChildren, useContext } from 'react';

interface ContextProps {}

const StateContext = createContext<ContextProps>({} as ContextProps);

export function StateProvider(props: PropsWithChildren) {
  return (
    <StateContext.Provider value={{}}>{props.children}</StateContext.Provider>
  );
}

export function useGlobalState() {
  const state = useContext(StateContext);
  if (!state) {
    throw new Error('useGlobalState must be call within the StateProvider');
  }
  return state;
}
