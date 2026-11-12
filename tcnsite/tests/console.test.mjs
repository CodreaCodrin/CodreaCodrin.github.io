import { test } from 'node:test';
import { sortByTitle, sortByRating } from '../src/components/collections/sortByTitle.ts';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { runCommand, resolvePath, completePath, tokenize } from '../src/components/command/fileSystem.ts';
import { validDiscoveries, readStored, writeStored } from '../src/lib/storage.ts';

const read = name => JSON.parse(readFileSync(new URL('../data/' + name + '.json', import.meta.url), 'utf8').replace(/^\uFEFF/, ''));
const root = read('consoleFS');
const command = (input, cwd = '/') => runCommand(input, cwd, root);

test('ratings sort descending with alphabetical ties and react to changed scores', () => {
  const items = [{ title: 'Zebra', rating: 4.5 }, { title: 'Apple', rating: 4.5 }, { title: 'Cherry', rating: 0 }, { title: 'Banana', rating: 5 }];
  const original = JSON.stringify(items);
  assert.deepEqual(sortByRating(items).map(item => item.title), ['Banana', 'Apple', 'Zebra', 'Cherry']);
  assert.equal(JSON.stringify(items), original);
  const changed = items.map(item => item.title === 'Cherry' ? { ...item, rating: 5 } : item);
  assert.deepEqual(sortByRating(changed).map(item => item.title), ['Banana', 'Cherry', 'Apple', 'Zebra']);
});

test('hidden entries autocomplete only after their actual paths have been revealed', () => {
  const known = new Set();
  assert.equal(completePath('cat cof', '/', root, ['cat'], known), 'cat cof');
  assert.equal(command('ls').revealedPaths, undefined);
  const listing = command('ls -a ../', '/tierlists');
  for (const path of listing.revealedPaths) known.add(path);
  assert.deepEqual([...known], ['/coffin']);
  assert.equal(completePath('cat cof', '/', root, ['cat'], known), 'cat coffin');
  assert.equal(completePath('./cof', '/', root, [], known), './coffin');
  assert.equal(completePath('vim ../cof', '/tierlists', root, ['vim'], known), 'vim ../coffin');
  assert.equal(completePath('cat cof', '/tierlists', root, ['cat'], known), 'cat cof');
  const fixture = { type: 'directory', name: '/', children: [
    { type: 'directory', name: 'secret', hidden: true, children: [] },
    { type: 'directory', name: '.dotfolder', children: [] },
  ] };
  const hidden = new Set(runCommand('ls -a', '/', fixture).revealedPaths);
  assert.equal(completePath('cd sec', '/', fixture, ['cd'], hidden), 'cd secret/');
  assert.equal(completePath('cd .do', '/', fixture, ['cd'], hidden), 'cd .dotfolder/');
});

test('alphabetical ordering is independent of rating and preserves source data', () => {
  const items = [{ title: 'Zebra', rating: 5 }, { title: 'apple', rating: 0 }, { title: 'Book 10', rating: 4 }, { title: 'Book 2', rating: 1 }];
  const snapshot = JSON.stringify(items);
  assert.deepEqual(sortByTitle(items).map(item => item.title), ['apple', 'Book 2', 'Book 10', 'Zebra']);
  assert.equal(JSON.stringify(items), snapshot);
  assert.deepEqual(sortByTitle(items.map(item => ({ ...item, rating: 5 - item.rating }))).map(item => item.title), ['apple', 'Book 2', 'Book 10', 'Zebra']);
});

test('tierlist cover proportions match Houseki no Kuni while retaining image dimensions', () => {
  const data = read('manhwaTierlist');
  const reference = data.items.find(item => item.title === 'Houseki no Kuni');
  assert.equal(data.coverAspectRatio.width / data.coverAspectRatio.height, reference.width / reference.height);
  assert.equal(data.sort, 'rating');
});

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

test('ls resolves current and parent directories with trailing slashes', () => {
  assert.deepEqual(command('ls ./'), command('ls'));
  assert.deepEqual(command('ls ../', '/games_folder'), command('ls /'));
  assert.deepEqual(command('ls ../', '/'), command('ls /'));
  assert.deepEqual(command('ls ./', '/games_folder'), command('ls /games_folder'));
});

test('ls -a reveals hidden files and directories without advertising the flag', () => {
  assert.ok(!command('ls').nodes.some(node => node.name === 'coffin'));
  for (const input of ['ls -a', 'ls -a ./', 'ls ./ -a'])
    assert.ok(command(input).nodes.some(node => node.name === 'coffin'), input);
  assert.ok(command('ls -a ../', '/games_folder').nodes.some(node => node.name === 'coffin'));
  const fixture = { type: 'directory', name: '/', children: [
    { type: 'directory', name: 'secret', hidden: true, children: [] },
    { type: 'directory', name: '.dotfolder', children: [] },
  ] };
  assert.equal(runCommand('ls', '/', fixture).nodes.length, 0);
  assert.equal(runCommand('ls -a', '/', fixture).nodes.length, 2);
  assert.ok(!JSON.stringify(read('console').commands).includes('-a'));
  assert.equal(completePath('cat cof', '/', root, ['cat']), 'cat cof');
  for (const method of ['cat', 'open', 'nano', 'vim'])
    assert.equal(command(method + ' /coffin').file.message, 'nu trebuia sa gasesti asta, esti bun');
  assert.equal(command('./coffin').file.action, 'message');
});

test('nano and vim execute files with paths and validate their arguments', () => {
  for (const method of ['nano', 'vim']) {
    assert.deepEqual(command(method + ' art_gallery'), command('cat art_gallery'));
    assert.deepEqual(command(method + ' ../art_gallery', '/tierlists'), command('cat art_gallery'));
    assert.equal(command(method).error, 'invalidArguments');
    assert.equal(command(method + ' a b').error, 'invalidArguments');
    assert.equal(command(method + ' games_folder').error, 'isDirectory');
    assert.equal(command(method + ' missing').error, 'notFound');
  }
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
