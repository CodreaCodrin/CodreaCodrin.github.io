interface ShortcutConfig { backKey: string; pages: { key: string; path: string }[] }
type KeyEvent = Pick<KeyboardEvent, 'key' | 'repeat' | 'isComposing' | 'ctrlKey' | 'altKey' | 'metaKey' | 'shiftKey' | 'defaultPrevented'>;
export function navigationShortcut(event: KeyEvent, blocked: boolean, config: ShortcutConfig): { kind: 'back' } | { kind: 'page'; path: string } | null {
  if (blocked || event.defaultPrevented || event.repeat || event.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return null;
  if (event.key === config.backKey) return { kind: 'back' };
  const page = config.pages.find(item => item.key.toLowerCase() === event.key.toLowerCase());
  return page ? { kind: 'page', path: page.path } : null;
}
