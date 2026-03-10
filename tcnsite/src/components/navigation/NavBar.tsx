import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import ThemeDropdown from './ThemeDropdown';
import MenuOverlay from './MenuOverlay';

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <nav className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1">
          <span
            onClick={() => navigate({ to: '/' })}
            className="text-2xl font-extrabold tracking-tight select-none cursor-pointer"
            style={{ color: 'var(--color-primary)' }}
          >
            Miel
          </span>
          <span
            className="text-[10px] opacity-50 select-none whitespace-nowrap"
            style={{ color: 'var(--color-text)' }}
          >
            ← shortcut to home
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeDropdown />
          <button
            onClick={() => setMenuOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded cursor-pointer transition-colors duration-200"
            style={{
              color: 'var(--color-text)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
            }}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </nav>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
