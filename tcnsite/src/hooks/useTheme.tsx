import { createContext, useContext, useState, useLayoutEffect, type ReactNode } from 'react';
import data from '../../data/themes.json';
export type ThemeName = keyof typeof data.themes;
interface ThemeContextType { themeName: ThemeName; setTheme: (name: ThemeName) => void }
const ThemeContext = createContext<ThemeContextType | null>(null);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setTheme] = useState<ThemeName>(() => {
    try {
      const saved = localStorage.getItem(data.storageKey);
      if (saved && Object.hasOwn(data.themes, saved)) return saved as ThemeName;
    } catch { /* Storage may be disabled; the theme still works in memory. */ }
    return data.defaultTheme as ThemeName;
  });
  useLayoutEffect(() => {
    const theme = data.themes[themeName];
    for (const [key, value] of Object.entries(theme.colors)) document.documentElement.style.setProperty(key, value);
    document.documentElement.style.colorScheme = theme.colorScheme;
    try { localStorage.setItem(data.storageKey, themeName); } catch { /* Optional persistence. */ }
  }, [themeName]);
  return <ThemeContext.Provider value={{ themeName, setTheme }}>{children}</ThemeContext.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('ThemeProvider is required');
  return context;
}
