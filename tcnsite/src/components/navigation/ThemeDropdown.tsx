import { useState, useRef, useEffect } from 'react';
import { Paintbrush } from 'lucide-react';
import { useTheme, type ThemeName } from '../../hooks/useTheme';

const themeLabels: Record<ThemeName, string> = {
  dark: 'Amber Miel',
  blue: 'Midnight Miel',
};

export default function ThemeDropdown() {
  const { themeName, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center justify-center w-9 h-9 rounded cursor-pointer transition-colors duration-200"
        style={{
          color: 'var(--color-text)',
          backgroundColor: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
        }}
        aria-label="Change theme"
      >
        <Paintbrush size={18} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-44 rounded shadow-lg z-50 py-1"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          {(Object.keys(themeLabels) as ThemeName[]).map((key) => (
            <button
              key={key}
              onClick={() => { setTheme(key); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm cursor-pointer transition-colors duration-150"
              style={{
                color: themeName === key ? 'var(--color-primary)' : 'var(--color-text)',
                backgroundColor: themeName === key ? 'var(--color-bg)' : 'transparent',
                fontWeight: themeName === key ? 600 : 400,
              }}
              onMouseEnter={(e) => {
                if (themeName !== key) e.currentTarget.style.backgroundColor = 'var(--color-bg)';
              }}
              onMouseLeave={(e) => {
                if (themeName !== key) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {themeLabels[key]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
