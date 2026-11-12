import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { runCommand, resolvePath, completePath, tokenize } from '../src/components/command/fileSystem.ts';
import { validDiscoveries, readStored, writeStored } from '../src/lib/storage.ts';

const read = name => JSON.parse(readFileSync(new URL('../data/' + name + '.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''));
const root = read('consoleFS');
const command = (input, cwd = '/') => runCommand(input, cwd, root);

test('configured pages have unique routes, real data files and consistent discovery IDs', () => {
  const reserved = ['/', '/aboutme', '/projects', '/hobbies', '/contactme', '/art-gallery', '/manwa-manga-tierlist', '/manhwa-tierlist'];
  const pages = read('pages');
  const paths = [...reserved, ...pages.map(page => page.path)];
  assert.equal(new Set(paths).size, paths.length, 'Duplicate route path');
  for (const page of pages) {
    assert.ok(page.path.startsWith('/') && !page.path.includes('#'));
    assert.ok(['content', 'gallery', 'tierlist'].includes(page.type));
    assert.ok(!page.dataFile.includes('..') && page.dataFile.endsWith('.json'));
    const data = read(page.dataFile.replace(/\.json$/, ''));
    assert.ok(data.title);
    if (page.type === 'content') assert.ok(Array.isArray(data.paragraphs));
    else {
      assert.ok(Array.isArray(data.items));
      assert.equal(data.discoveryId || undefined, page.discoveryId);
    }
    if (page.discoveryId) assert.ok(read('discovery').items.some(item => item.id === page.discoveryId && item.path === page.path));
  }
});

test('responsive background candidates exist and are smaller than the originals', () => {
  const themes = read('themes');
  for (const [original, candidates] of Object.entries(themes.backgroundVariants)) {
    const originalBytes = readFileSync(new URL('../public/' + original, import.meta.url)).length;
    for (const candidate of candidates) {
      assert.ok(candidate.width > 0);
      const bytes = readFileSync(new URL('../public/' + candidate.path, import.meta.url)).length;
      assert.ok(bytes < originalBytes);
    }
  }
});

test('root and nested directories expose precisely the requested files', () => {
  assert.deepEqual(command('ls').nodes.map(node => node.name), ['games_folder', 'tierlists', 'art_gallery']);
  assert.deepEqual(command('ls games_folder').nodes.map(node => node.name), ['riot_account', 'chess_account', 'steam_account']);
  assert.deepEqual(command('ls /tierlists').nodes.map(node => node.name), ['manwa-manga-tierlist']);
});
test('cd handles relative, absolute, parent, home, repeated slashes and root boundaries', () => {
  for (const [input, cwd, path] of [
    ['cd games_folder', '/', '/games_folder'], ['cd ..', '/games_folder', '/'],
    ['cd ../../..', '/', '/'], ['cd /tierlists', '/games_folder', '/tierlists'],
    ['cd ../tierlists', '/games_folder', '/tierlists'], ['cd', '/tierlists', '/'],
    ['cd ~', '/games_folder', '/'], ['cd ~/tierlists/', '/games_folder', '/tierlists'],
    ['cd //games_folder/./', '/', '/games_folder'],
  ]) assert.deepEqual(command(input, cwd), { kind: 'cd', path }, input);
});
test('all execution aliases resolve to the same file', () => {
  const expected = command('cat /art_gallery').file;
  for (const input of ['cat art_gallery', 'open art_gallery', './art_gallery', 'cat "./art_gallery"'])
    assert.deepEqual(command(input).file, expected);
  assert.equal(command('./manhwa_tierlist', '/tierlists').file.discoveryId, 'manhwa-tierlist');
  assert.deepEqual(command('./manwa-manga-tierlist', '/tierlists').file, command('./manhwa_tierlist', '/tierlists').file);
  assert.equal(read('discovery').items.find(item => item.id === 'manhwa-tierlist').path, '/manwa-manga-tierlist');
  assert.equal(command('open ../art_gallery', '/games_folder').file.discoveryId, 'art-gallery');
});
test('file paths are walked without skipping invalid intermediate components', () => {
  for (const input of ['cd art_gallery', 'cd art_gallery/..', 'cat art_gallery/'])
    assert.equal(command(input).error, 'notDirectory', input);
  assert.equal(command('cd missing/..').error, 'notFound');
  assert.equal(command('cat games_folder').error, 'isDirectory');
  assert.equal(command('ls nope').error, 'notFound');
});
test('malformed commands are safe and produce actionable errors', () => {
  assert.equal(command('cat').error, 'invalidArguments');
  assert.equal(command('ls a b').error, 'invalidArguments');
  assert.equal(command('help arg').error, 'invalidArguments');
  assert.equal(command('./art_gallery arg').error, 'invalidArguments');
  assert.equal(command('rm -rf /').error, 'unknownCommand');
  assert.equal(command('cat "art_gallery').error, 'unclosedQuote');
  assert.equal(command('cat art_gallery; alert(1)').error, 'invalidArguments');
  assert.equal(command('cat $(whoami)').error, 'notFound');
  assert.deepEqual(command('   '), { kind: 'empty' });
  assert.deepEqual(tokenize('cat "a b"'), ['cat', 'a b']);
});
test('help, clear and pwd operate without changing the filesystem', () => {
  assert.deepEqual(command('help'), { kind: 'help' });
  assert.deepEqual(command('clear'), { kind: 'clear' });
  assert.deepEqual(command('pwd', '/games_folder'), { kind: 'pwd', path: '/games_folder' });
  assert.equal(resolvePath(root, '/', '/').node, root);
});
test('completion supports directories, executable paths and ambiguous prefixes', () => {
  const commands = read('console').commands.map(item => item.name);
  assert.equal(completePath('he', '/', root, commands), 'help ');
  assert.equal(completePath('cd ga', '/', root, commands), 'cd games_folder/');
  assert.equal(completePath('./art', '/', root, commands), './art_gallery');
  assert.equal(completePath('cat /games_folder/ch', '/', root, commands), 'cat /games_folder/chess_account');
  assert.equal(completePath('c', '/', root, commands), 'c');
});
test('persisted discoveries reject invalid shapes, unknown IDs and duplicates', () => {
  const allowed = read('discovery').items.map(item => item.id);
  for (const invalid of [null, {}, 5, 'art-gallery']) assert.deepEqual(validDiscoveries(invalid, allowed), []);
  assert.deepEqual(validDiscoveries(['art-gallery', 12, 'unknown', 'art-gallery'], allowed), ['art-gallery']);
});
test('storage failures and malformed JSON never break the app', () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  try {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
      getItem: () => '{bad json', setItem: () => { throw new Error('blocked'); },
    } });
    assert.equal(readStored('test'), null);
    assert.equal(writeStored('test', []), false);
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, get: () => { throw new Error('disabled'); } });
    assert.equal(readStored('test'), null);
    assert.equal(writeStored('test', []), false);
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
  }
});
test('JSON collection and discovery references are consistent', () => {
  const discoveries = read('discovery').items;
  const files = root.children.flatMap(node => node.type === 'directory' ? node.children : [node]);
  for (const file of files.filter(item => item.action === 'unlock'))
    assert.ok(discoveries.some(item => item.id === file.discoveryId));
  for (const name of ['artGallery', 'manhwaTierlist']) {
    const data = read(name);
    assert.ok(discoveries.some(item => item.id === data.discoveryId));
    assert.equal(new Set(data.items.map(item => item.id)).size, data.items.length);
    for (const item of data.items) {
      assert.ok(item.width > 0 && item.height > 0 && item.alt && item.title);
      if (name === 'manhwaTierlist') assert.ok(item.rating >= 0 && item.rating <= 5 && Number.isInteger(item.rating * 2));
      if (item.image) assert.ok(existsSync(new URL('../public/' + data.assetDirectory + '/' + item.image, import.meta.url)));
      else assert.equal(item.sample, true);
    }
  }
});
