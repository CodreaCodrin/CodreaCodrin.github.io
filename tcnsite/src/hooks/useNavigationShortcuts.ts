import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import data from '../../data/shortcuts.json';
import { navigationShortcut } from '../lib/keyboardShortcuts';

export function useNavigationShortcuts() {
  const router = useRouter();
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      const target = event.target;
      const editing = target instanceof HTMLElement && (target.isContentEditable || Boolean(target.closest('input, textarea, select, [role="textbox"], [role="combobox"]')));
      const blocked = editing || Boolean(document.querySelector('dialog[open], [role="dialog"], .theme-options'));
      const action = navigationShortcut(event, blocked, data);
      if (!action) return;
      event.preventDefault();
      if (action.kind === 'back' && router.history.canGoBack()) {
        router.history.back();
        return;
      }
      const path = action.kind === 'back' ? data.homePath : action.path;
      if (router.state.location.pathname !== path) void router.navigate({ to: path });
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [router]);
}
