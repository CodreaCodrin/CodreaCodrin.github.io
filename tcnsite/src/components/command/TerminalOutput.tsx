import { memo } from 'react';
import { Folder, FileCode, Unlock } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { commandForListedNode, type CommandResult } from './fileSystem';
import AccountOutput from './AccountOutput';
import copy from '../../../data/console.json';
import discovery from '../../../data/discovery.json';
import { format } from '../../lib/format';

export interface TerminalEntry { id: number; command: string; cwd: string; result: CommandResult; message?: string }
function TerminalOutput({ entry, onExecute, onNavigate }: {
  entry: TerminalEntry; onExecute: (command: string, listAfterCd?: boolean) => void; onNavigate: () => void;
}) {
  const { result } = entry;
  switch (result.kind) {
    case 'error': return <p className="terminal-error">{format(copy[result.error], {
      path: result.value, command: result.value,
      usage: copy.commands.find(command => command.name === result.value)?.usage ?? '',
    })}</p>;
    case 'list': return result.nodes.length ? <ul className="terminal-files">{result.nodes.map(node =>
      <li key={node.name} className={node.type === 'directory' ? 'directory' : ''}>
        <button type="button" className="terminal-entry-button"
          onClick={() => onExecute(commandForListedNode(result, node), node.type === 'directory')}>
          {node.type === 'directory' ? <Folder size={14} aria-hidden="true" /> : <FileCode size={14} aria-hidden="true" />}
          {node.name}{node.type === 'directory' ? '/' : ''}
        </button>
      </li>)}</ul> : <p>{copy.emptyDirectory}</p>;
    case 'help': return <dl className="terminal-help">{copy.commands.map(command =>
      <div key={command.name}><dt>{command.usage}</dt><dd>{command.description}</dd></div>)}</dl>;
    case 'pwd': return <p>{result.path}</p>;
    case 'execute': {
      const file = result.file;
      if (file.action === 'unlock') {
        const page = discovery.items.find(item => item.id === file.discoveryId);
        return <div className="unlock-output"><Unlock size={18} /><div>
          <p>{entry.message}</p>
          {page && <Link className="text-link" to={page.path} onClick={onNavigate}>{format(copy.openDiscovery, { title: page.text })}</Link>}
        </div></div>;
      }
      if (file.action === 'message') return <p>{file.message}</p>;
      if (file.action === 'page' && file.path) return <Link className="text-link" to={file.path} onClick={onNavigate}>
        {file.title ?? file.name}
      </Link>;
      return ['account', 'profile'].includes(file.action) ? <AccountOutput file={file} /> : <p>{copy.unsupportedFile}</p>;
    }
    default: return null;
  }
}

export default memo(TerminalOutput);
