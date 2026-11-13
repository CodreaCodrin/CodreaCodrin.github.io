import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import data from '../../../data/site.json';
// Native dialogs provide focus containment, Escape dismissal, and an inert background.
export default function Modal({ title, children, onClose, className = '' }: {
  title: string; children: ReactNode; onClose: () => void; className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    const root = document.documentElement;
    const overflow = root.style.overflowY;
    root.style.overflowY = 'hidden';
    return () => { dialog?.close(); root.style.overflowY = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={ref} className={`modal ${className}`} aria-label={title}
    onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal-inner">
      <button className="icon-button modal-close" onClick={onClose} aria-label={data.close}><X size={20} /></button>
      {children}
    </div>
  </dialog>;
}
