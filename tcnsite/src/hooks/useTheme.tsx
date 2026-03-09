import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface Theme {
  '--color-primary': string;
  '--color-secondary': string;
  '--color-accent': string;
  '--color-bg': string;
  '--color-bg-secondary': string;
  '--color-text': string;
  '--color-text-muted': string;
  '--color-border': string;
}

const darkTheme: Theme = {
  '--color-primary': '#e87a1e',       // orange
  '--color-secondary': '#1a1a1a',     // black
  '--color-accent': '#f5a623',        // light orange
  '--color-bg': '#111111',            // deep black
  '--color-bg-secondary': '#1e1e1e',  // dark gray
  '--color-text': '#e0e0e0',          // light gray text
  '--color-text-muted': '#9a9a9a',    // muted gray
  '--color-border': '#3a3a3a',        // border gray
};

const blueTheme: Theme = {
  '--color-primary': '#3b82f6',       // blue
  '--color-secondary': '#0a0a0f',     // deep dark blue-black
  '--color-accent': '#60a5fa',        // light blue
  '--color-bg': '#0d0d14',            // dark navy black
  '--color-bg-secondary': '#151520',  // dark blue-gray
  '--color-text': '#dde4f0',          // cool light gray
  '--color-text-muted': '#7a8ba8',    // muted blue-gray
  '--color-border': '#2a3550',        // blue-tinted border
};

export const themes = { dark: darkTheme, blue: blueTheme } as const;
export type ThemeName = keyof typeof themes;

export const themeBackgrounds: Record<ThemeName, string> = {
  dark: '/BlackGoldBackground.jpg',
  blue: '/BlackBlueBackground.jpg',
};

interface ThemeContextType {
  themeName: ThemeName;
  theme: Theme;
  setTheme: (name: ThemeName) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function applyTheme(theme: Theme, themeName: ThemeName) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme)) {
    root.style.setProperty(key, value);
  }
  root.style.setProperty('--bg-image', `url(${themeBackgrounds[themeName]})`);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('theme') as ThemeName | null;
    return saved && saved in themes ? saved : 'dark';
  });

  const theme = themes[themeName];

  useEffect(() => {
    applyTheme(theme, themeName);
    localStorage.setItem('theme', themeName);
  }, [themeName, theme]);

  const setTheme = (name: ThemeName) => setThemeName(name);
  const toggleTheme = () => setThemeName(prev => prev === 'dark' ? 'blue' : 'dark');

  return (
    <ThemeContext.Provider value={{ themeName, theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
