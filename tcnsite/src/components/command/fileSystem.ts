export interface Stat { label: string; value: string | number }
export interface ConsoleFile {
  type: 'file'; name: string; aliases?: string[]; action: 'unlock' | 'account' | 'profile';
  discoveryId?: string; provider?: string; title?: string; description?: string;
  accountId?: string; profileUrl?: string; endpoint?: string; mockStats?: Stat[];
}
export interface Directory { type: 'directory'; name: string; children: FSNode[] }
export type FSNode = Directory | ConsoleFile;
export type ShellError = 'notFound' | 'notDirectory' | 'isDirectory' | 'unknownCommand' | 'invalidArguments' | 'unclosedQuote';
export type CommandResult =
  | { kind: 'error'; error: ShellError; value: string }
  | { kind: 'list'; nodes: FSNode[] }
  | { kind: 'cd'; path: string }
  | { kind: 'execute'; file: ConsoleFile }
  | { kind: 'pwd'; path: string }
  | { kind: 'help' | 'clear' | 'empty' };

// Tokenize without eval: quotes are supported, pipes and substitutions never execute.
export function tokenize(input: string): string[] | null {
  const tokens: string[] = [];
  let token = '', quote = '', active = false;
  for (const character of input.trim()) {
    if (quote) {
      if (character === quote) quote = '';
      else token += character;
      active = true;
    } else if (character === '"' || character === "'") { quote = character; active = true; }
    else if (/\s/.test(character)) { if (active) { tokens.push(token); token = ''; active = false; } }
    else { token += character; active = true; }
  }
  if (quote) return null;
  if (active) tokens.push(token);
  return tokens;
}

export function resolvePath(root: Directory, cwd: string, input: string):
  { node: FSNode; path: string } | { error: 'notFound' | 'notDirectory' } {
  const expanded = input === '~' ? '/' : input.startsWith('~/') ? input.slice(1) : input;
  const parts = (expanded.startsWith('/') ? expanded : `${cwd}/${expanded}`).split('/');
  const stack: FSNode[] = [root];
  const names: string[] = [];
  for (const part of parts) {
    if (!part) continue;
    const current = stack[stack.length - 1];
    if (current.type !== 'directory') return { error: 'notDirectory' };
    if (part === '.') continue;
    if (part === '..') { if (stack.length > 1) { stack.pop(); names.pop(); } continue; }
    const next = current.children.find(node => node.name === part || (node.type === 'file' && node.aliases?.includes(part)));
    if (!next) return { error: 'notFound' };
    stack.push(next); names.push(part);
  }
  const node = stack[stack.length - 1];
  if (expanded.endsWith('/') && node.type !== 'directory') return { error: 'notDirectory' };
  return { node, path: '/' + names.join('/') };
}

export function runCommand(input: string, cwd: string, root: Directory): CommandResult {
  const tokens = tokenize(input);
  if (!tokens) return { kind: 'error', error: 'unclosedQuote', value: '' };
  if (!tokens.length) return { kind: 'empty' };
  const [command, ...args] = tokens;
  const direct = command.startsWith('./');
  const name = direct ? './' : command;
  const noArgs = ['help', 'pwd', 'clear'].includes(name);
  if (!['ls', 'cd', 'cat', 'open', './', 'help', 'pwd', 'clear'].includes(name))
    return { kind: 'error', error: 'unknownCommand', value: command };
  if ((noArgs && args.length) || (direct && args.length) || args.length > 1 ||
      (['cat', 'open'].includes(name) && (!args.length || !args[0])))
    return { kind: 'error', error: 'invalidArguments', value: name };
  if (name === 'help' || name === 'clear') return { kind: name };
  if (name === 'pwd') return { kind: 'pwd', path: cwd };
  const path = direct ? command : args[0] ?? (name === 'cd' ? '/' : '.');
  const result = resolvePath(root, cwd, path);
  if ('error' in result) return { kind: 'error', error: result.error, value: path };
  if (name === 'cd') return result.node.type === 'directory'
    ? { kind: 'cd', path: result.path }
    : { kind: 'error', error: 'notDirectory', value: path };
  if (name === 'ls') return { kind: 'list', nodes: result.node.type === 'directory' ? result.node.children : [result.node] };
  return result.node.type === 'file'
    ? { kind: 'execute', file: result.node }
    : { kind: 'error', error: 'isDirectory', value: path };
}

export function completePath(input: string, cwd: string, root: Directory, commands: string[]) {
  const parts = input.split(/\s+/);
  const fragment = parts[parts.length - 1];
  if (parts.length === 1 && !fragment.includes('/')) {
    const matches = commands.filter(name => name.startsWith(fragment));
    return matches.length === 1 ? matches[0] + ' ' : input;
  }
  const slash = fragment.lastIndexOf('/');
  const directory = slash < 0 ? '.' : fragment.slice(0, slash + 1);
  const prefix = slash < 0 ? '' : fragment.slice(0, slash + 1);
  const partial = fragment.slice(slash + 1);
  const resolved = resolvePath(root, cwd, directory);
  if ('error' in resolved || resolved.node.type !== 'directory') return input;
  const matches = resolved.node.children.filter(node => node.name.startsWith(partial) && (parts[0] !== 'cd' || node.type === 'directory'));
  if (matches.length !== 1) return input;
  return input.slice(0, input.length - fragment.length) + prefix + matches[0].name + (matches[0].type === 'directory' ? '/' : '');
}
