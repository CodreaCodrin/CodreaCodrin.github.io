import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runCommand, completePath } from '../src/components/command/fileSystem.ts';
const read = name => JSON.parse(readFileSync(new URL('../data/' + name + '.json', import.meta.url), 'utf8'));
const root = read('consoleFS');
const run = (input, cwd = '/') => runCommand(input, cwd, root);

test('Linux listing spellings reuse the same listing and hidden discovery behavior', () => {
  for (const input of ['la', 'la -a', 'ls -all', 'ls --all', 'ls -A', 'ls -al', 'ls -la', 'ls -lah', 'll -a', 'lla']) {
    assert.deepEqual(run(input), run('ls -a'), input);
  }
  for (const input of ['l', 'll', 'dir', 'vdir', 'ls -lh', 'ls -l -h --color=auto', 'ls -1F']) {
    assert.deepEqual(run(input), run('ls'), input);
  }
  assert.deepEqual(run('la -all ../', '/games_folder'), run('ls -a /'));
  assert.deepEqual(run('ll ./'), run('ls ./'));
  for (const input of ['ls -R', 'ls --unknown', 'ls -az', 'll a b']) assert.equal(run(input).error, 'invalidArguments');
});

test('viewers and editors execute existing files without introducing other actions', () => {
  for (const method of ['less', 'more', 'bat', 'vi', 'view', 'nvim', 'emacs', 'xdg-open']) {
    assert.deepEqual(run(`${method} art_gallery`), run('cat art_gallery'));
    assert.deepEqual(run(`${method} ../art_gallery`, '/games_folder'), run('cat art_gallery'));
    assert.equal(run(method).error, 'invalidArguments');
    assert.equal(run(`${method} games_folder`).error, 'isDirectory');
    assert.equal(run(`${method} missing`).error, 'notFound');
    assert.equal(run(`${method} art_gallery other`).error, 'invalidArguments');
  }
});

test('navigation, clear and help aliases retain existing command behavior', () => {
  assert.deepEqual(run('chdir games_folder'), run('cd games_folder'));
  assert.deepEqual(run('..', '/games_folder'), run('cd ..', '/games_folder'));
  assert.deepEqual(run('...', '/games_folder'), run('cd ../..', '/games_folder'));
  for (const method of ['cls', 'reset']) assert.deepEqual(run(method), run('clear'));
  assert.deepEqual(run('?'), run('help'));
  assert.equal(run('rm -rf /').error, 'unknownCommand');
  const advertised = read('console').commands.map(item => item.name);
  for (const alias of read('consoleAliases').commands) assert.ok(!advertised.includes(alias.name));
});

test('aliases autocomplete paths while keeping undiscovered files hidden', () => {
  assert.equal(completePath('nv', '/', root, []), 'nvim ');
  assert.equal(completePath('less art', '/', root, []), 'less art_gallery');
  assert.equal(completePath('chdir art', '/', root, []), 'chdir art');
  assert.equal(completePath('chdir gam', '/', root, []), 'chdir games_folder/');
  assert.equal(completePath('bat cof', '/', root, []), 'bat cof');
  const revealed = new Set(run('la -a').revealedPaths);
  assert.equal(completePath('bat cof', '/', root, [], revealed), 'bat coffin');
});
