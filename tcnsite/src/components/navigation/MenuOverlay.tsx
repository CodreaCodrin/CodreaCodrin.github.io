import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { X } from 'lucide-react';

const navItems = [
  { title: 'Ho', text: 'home', path: '/' },
  { title: 'Ab', text: 'about', path: '/aboutme' },
  { title: 'Pr', text: 'projects', path: '/projects' },
  { title: 'Ho', text: 'hobbies', path: '/hobbies' },
  { title: 'Ct', text: 'contact', path: '/contactme' },
] as const;

interface MenuOverlayProps {
  open: boolean;
  onClose: () => void;
}

type Phase = 'idle' | 'opening' | 'open' | 'closing';

export default function MenuOverlay({ open, onClose }: MenuOverlayProps) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('idle');
  const [curtainVisible, setCurtainVisible] = useState(false);
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rafsRef = useRef<number[]>([]);
  
  const clearAll = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    rafsRef.current.forEach(cancelAnimationFrame);
    rafsRef.current = [];
  }, []);

  // Handle open prop changes
  useEffect(() => {
    clearAll();

    if (open && (phase === 'idle' || phase === 'closing')) {
      // === OPEN ===
      setPhase('opening');
      setVisibleItems([]);
      setCurtainVisible(false);

      // Double rAF to ensure the browser paints scaleY(0) before animating to scaleY(1)
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          setCurtainVisible(true);
        });
        rafsRef.current.push(raf2);
      });
      rafsRef.current.push(raf1);

      // Stagger items in
      navItems.forEach((_, i) => {
        timersRef.current.push(
          setTimeout(() => {
            setVisibleItems(prev => [...prev, i]);
            if (i === navItems.length - 1) setPhase('open');
          }, 500 + i * 120)
        );
      });
    } else if (!open && (phase === 'open' || phase === 'opening')) {
      // === CLOSE ===
      setPhase('closing');

      // Hide items in reverse order
      const reversed = [...navItems.keys()].reverse();
      reversed.forEach((idx, step) => {
        timersRef.current.push(
          setTimeout(() => {
            setVisibleItems(prev => prev.filter(v => v !== idx));
          }, step * 100)
        );
      });

      const itemsDuration = navItems.length * 100;

      // Curtain goes back up
      timersRef.current.push(
        setTimeout(() => setCurtainVisible(false), itemsDuration + 50)
      );

      // Unmount
      timersRef.current.push(
        setTimeout(() => {
          setPhase('idle');
          setVisibleItems([]);
        }, itemsDuration + 550)
      );
    }

    return clearAll;
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleNav(path: string) {
    onClose();
    navigate({ to: path });
  }

  if (phase === 'idle') return null;

  return (
    <div className="fixed inset-0 z-40">
      {/* Dark curtain */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(6px)',
          transformOrigin: 'top',
          transform: curtainVisible ? 'scaleY(1)' : 'scaleY(0)',
        }}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-4 z-60 cursor-pointer transition-colors duration-200"
        style={{ color: 'var(--color-text)' }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text)'; }}
        aria-label="Close menu"
      >
        <X size={32} />
      </button>

      {/* Nav grid */}
      <div className="relative z-50 flex items-center justify-center h-full pointer-events-none">
        <div className="grid grid-cols-3 gap-6 pointer-events-auto">
          {navItems.map((item, i) => (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className="flex flex-col items-center justify-center w-36 h-36 border-2 cursor-pointer transition-all duration-300"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'transparent',
                color: 'var(--color-text)',
                opacity: visibleItems.includes(i) ? 1 : 0,
                transform: visibleItems.includes(i) ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease, border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.color = 'var(--color-text)';
              }}
            >
              <span className="text-5xl font-bold leading-none">{item.title}</span>
              <span className="mt-2 text-sm font-semibold tracking-wide">{item.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
