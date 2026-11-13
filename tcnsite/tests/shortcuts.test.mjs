import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { navigationShortcut } from '../src/lib/keyboardShortcuts.ts';
const config = JSON.parse(readFileSync(new URL('../data/shortcuts.json', import.meta.url)));
const key = (value, changes = {}) => ({ key: value, repeat: false, isComposing: false, ctrlKey: false, altKey: false, metaKey: false, shiftKey: false, defaultPrevented: false, ...changes });

test('page shortcuts match configured routes, including Caps Lock, and Backspace goes back', () => {
  for (const page of config.pages) {
    assert.deepEqual(navigationShortcut(key(page.key), false, config), { kind: 'page', path: page.path });
    assert.deepEqual(navigationShortcut(key(page.key.toUpperCase()), false, config), { kind: 'page', path: page.path });
  }
  assert.deepEqual(navigationShortcut(key('Backspace'), false, config), { kind: 'back' });
  assert.equal(navigationShortcut(key('x'), false, config), null);
  assert.equal(navigationShortcut(key('~'), false, config), null);
});

test('typing, dialogs, composition, held keys and browser shortcuts never navigate', () => {
  for (const value of ['a', 'p', 'h', 'c', 'Backspace']) {
    assert.equal(navigationShortcut(key(value), true, config), null);
    for (const flag of ['repeat', 'isComposing', 'ctrlKey', 'altKey', 'metaKey', 'shiftKey', 'defaultPrevented']) {
      assert.equal(navigationShortcut(key(value, { [flag]: true }), false, config), null);
    }
  }
});
