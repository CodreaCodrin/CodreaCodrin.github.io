import { memo } from 'react';
import { Folder, FileCode, Unlock } from 'lucide-react';
import type { CommandResult } from './fileSystem';
import AccountOutput from './AccountOutput';
import copy from '../../../data/console.json';
import { format } from '../../lib/format';

export interface TerminalEntry { id: number; command: string; cwd: string; result: CommandResult; message?: string }
function TerminalOutput({ entry }: { entry: TerminalEntry }) {
  const { result } = entry;
  switch (result.kind) {
    case 'error': return <p className="terminal-error">{format(copy[result.error], {
      path: result.value, command: result.value,
      usage: copy.commands.find(command => command.name === result.value)?.usage ?? '',
    })}</p>;
    case 'list': return result.nodes.length ? <ul className="terminal-files">{result.nodes.map(node =>
      <li key={node.name} className={node.type === 'directory' ? 'directory' : ''}>
        {node.type === 'directory' ? <Folder size={14} /> : <FileCode size={14} />}
        {node.name}{node.type === 'directory' ? '/' : ''}
      </li>)}</ul> : <p>{copy.emptyDirectory}</p>;
    case 'help': return <dl className="terminal-help">{copy.commands.map(command =>
      <div key={command.name}><dt>{command.usage}</dt><dd>{command.description}</dd></div>)}</dl>;
    case 'pwd': return <p>{result.path}</p>;
    case 'execute': return result.file.action === 'unlock'
      ? <div className="unlock-output"><Unlock size={18} /><p>{entry.message}</p></div>
      : result.file.action === 'message' ? <p>{result.file.message}</p>
      : ['account', 'profile'].includes(result.file.action) ? <AccountOutput file={result.file} /> : <p>{copy.unsupportedFile}</p>;
    default: return null;
  }
}

export default memo(TerminalOutput);
