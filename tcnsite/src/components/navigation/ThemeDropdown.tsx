import { useState, useRef, useEffect } from 'react';
import { Paintbrush, Check } from 'lucide-react';
import { useTheme, type ThemeName } from '../../hooks/useTheme';
import themes from '../../../data/themes.json';
import copy from '../../../data/site.json';
export default function ThemeDropdown() {
  const { themeName, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function outside(event: PointerEvent) { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); }
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  return <div ref={ref} className="theme-switcher" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }} onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } }}>
    <button ref={trigger} className="icon-button" onClick={() => setOpen(previous => !previous)} aria-label={copy.changeTheme} aria-expanded={open}>
      <Paintbrush size={18} />
    </button>
    {open && <div className="theme-options" role="group" aria-label={copy.changeTheme}>
      {(Object.keys(themes.themes) as ThemeName[]).map(key => <button key={key} aria-pressed={themeName === key}
        onClick={() => { setTheme(key); setOpen(false); trigger.current?.focus(); }}>
        <span className="theme-swatch" style={{ background: themes.themes[key].colors['--color-primary'] }} />
        <span className="theme-option-label">{themes.themes[key].label}
          {'note' in themes.themes[key] && <small>{String(themes.themes[key].note)}</small>}
        </span>{themeName === key && <Check size={14} />}
      </button>)}
    </div>}
  </div>;
}
