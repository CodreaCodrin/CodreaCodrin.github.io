import { createContext, useContext, useState, type ReactNode } from 'react';
import data from '../../data/background.json';
import { readStored, writeStored } from '../lib/storage';

const BackgroundContext = createContext<{ background: string; selectBackground: (id: string) => void } | null>(null);
export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [background, setBackground] = useState(() => {
    const saved = readStored(data.storageKey);
    return typeof saved === 'string' && data.options.some(option => option.id === saved) ? saved : data.defaultBackground;
  });
  function selectBackground(id: string) {
    if (!data.options.some(option => option.id === id)) return;
    setBackground(id);
    writeStored(data.storageKey, id);
  }
  return <BackgroundContext.Provider value={{ background, selectBackground }}>{children}</BackgroundContext.Provider>;
}
export function useBackground() {
  const context = useContext(BackgroundContext);
  if (!context) throw new Error('BackgroundProvider is required');
  return context;
}
