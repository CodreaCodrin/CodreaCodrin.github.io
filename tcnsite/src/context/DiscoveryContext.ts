import { createContext, useContext } from 'react';
export interface DiscoveryState {
  unlocked: string[];
  glitchKey: number;
  notification: string;
  unlock: (id: string) => 'unlocked' | 'existing' | 'invalid';
}
export const DiscoveryContext = createContext<DiscoveryState | null>(null);
export function useDiscovery() {
  const context = useContext(DiscoveryContext);
  if (!context) throw new Error('DiscoveryProvider is required');
  return context;
}
