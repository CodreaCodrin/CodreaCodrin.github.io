import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import data from '../../data/discovery.json';
import { DiscoveryContext } from './DiscoveryContext';
import { readStored, validDiscoveries, writeStored } from '../lib/storage';
import { format } from '../lib/format';
const ids = data.items.map(item => item.id);
export default function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(() => validDiscoveries(readStored(data.storageKey), ids));
  const current = useRef(unlocked);
  const [glitchKey, setGlitchKey] = useState(0);
  const [notification, setNotification] = useState('');
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const unlock = useCallback((id: string) => {
    const item = data.items.find(entry => entry.id === id);
    if (!item) return 'invalid';
    if (current.current.includes(id)) return 'existing';
    const next = [...new Set([...current.current, ...validDiscoveries(readStored(data.storageKey), ids), id])];
    current.current = next;
    const saved = writeStored(data.storageKey, next);
    setUnlocked(next);
    setGlitchKey(key => key + 1);
    setNotification(format(data.unlocked, { title: item.text }) + (saved ? '' : ` ${data.storageUnavailable}`));
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotification(''), data.toastDurationMs);
    return 'unlocked';
  }, []);
  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key !== data.storageKey && event.key !== null) return;
      const next = validDiscoveries(readStored(data.storageKey), ids);
      current.current = next;
      setUnlocked(next);
    }
    window.addEventListener('storage', sync);
    return () => { clearTimeout(noticeTimer.current); window.removeEventListener('storage', sync); };
  }, []);
  return <DiscoveryContext.Provider value={{ unlocked, glitchKey, notification, unlock }}>{children}</DiscoveryContext.Provider>;
}
