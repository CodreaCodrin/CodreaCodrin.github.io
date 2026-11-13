import { useEffect, useRef } from 'react';
import { useDiscovery } from '../context/DiscoveryContext';
import data from '../../data/discovery.json';
export function useDiscoveryEffect<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const { glitchKey } = useDiscovery();
  useEffect(() => {
    if (!glitchKey || !ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = ref.current.animate([
      { transform: 'translateX(0)' },
      { transform: 'translateX(-3px) skewX(-0.5deg)' },
      { transform: 'translateX(3px)' },
      { transform: 'translateX(-2px)' },
      { transform: 'translateX(0)' },
    ], { duration: data.glitchDurationMs, easing: 'steps(2, end)' });
    return () => animation.cancel();
  }, [glitchKey]);
  return ref;
}
