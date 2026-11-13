import { useEffect, useRef, useState } from 'react';
import { Wallpaper, Check } from 'lucide-react';
import { useBackground } from '../../context/BackgroundContext';
import data from '../../../data/background.json';

export default function BackgroundPicker() {
  const { background, selectBackground } = useBackground();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  return <div ref={ref} className="theme-switcher" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }} onKeyDown={event => {
    if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
  }}>
    <button ref={trigger} className="icon-button" aria-label={data.buttonLabel} title={data.buttonLabel}
      aria-expanded={open} onClick={() => setOpen(value => !value)}><Wallpaper size={18} /></button>
    {open && <div className="theme-options background-options" role="group" aria-label={data.buttonLabel}>
      {data.options.map(option => <button key={option.id} aria-pressed={background === option.id}
        onClick={() => { selectBackground(option.id); setOpen(false); trigger.current?.focus(); }}>
        <span className="background-option-copy"><span>{option.label}</span><small>{option.description}</small></span>
        {background === option.id && <Check size={14} />}
      </button>)}
    </div>}
  </div>;
}
