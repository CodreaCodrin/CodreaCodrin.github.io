import { useEffect, useRef } from 'react';
import { useDiscovery } from '../context/DiscoveryContext';
import data from '../../data/discovery.json';
export function useDiscoveryEffect<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const { glitchKey } = useDiscovery();
  useEffect(() => {
    if (!glitchKey || !ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = ref.current.animate([
      { opacity: 1 },
      { opacity: 0.75 },
      { opacity: 1 },
    ], { duration: data.glitchDurationMs, easing: 'ease-out' });
    return () => animation.cancel();
  }, [glitchKey]);
  return ref;
}
