import './Terminal.css';
import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Terminal as TerminalIcon, X, CornerDownLeft } from 'lucide-react';
import rawFS from '../../../data/consoleFS.json';
import copy from '../../../data/console.json';
import discovery from '../../../data/discovery.json';
import { completePath, runCommand, type Directory } from './fileSystem';
import TerminalOutput, { type TerminalEntry } from './TerminalOutput';
import { useDiscovery } from '../../context/DiscoveryContext';
import { format } from '../../lib/format';

const fs = rawFS as Directory;
export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [hintSeen, setHintSeen] = useState(false);
  const [cwd, setCwd] = useState('/');
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [knownHidden, setKnownHidden] = useState<Set<string>>(() => new Set());
  const draft = useRef('');
  const nextId = useRef(0);
  const field = useRef<HTMLInputElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const followOutput = useRef(true);
  const { unlock } = useDiscovery();
  const close = useCallback(() => { setClosing(true); setOpen(false); launcher.current?.focus(); }, []);

  useEffect(() => {
    if (!open) return;
    field.current?.focus();
    const observer = new ResizeObserver(() => {
      if (followOutput.current && viewport.current) viewport.current.scrollTop = viewport.current.scrollHeight;
    });
    if (content.current) observer.observe(content.current);
    return () => observer.disconnect();
  }, [open]);

  useEffect(() => {
    function shortcut(event: globalThis.KeyboardEvent) {
      if (event.repeat || event.isComposing || event.ctrlKey || event.altKey || event.metaKey) return;
      if (event.code !== 'Backquote' && event.key !== '~' && event.key !== '\x60') return;
      const target = event.target as HTMLElement | null;
      const editing = target?.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]');
      if (editing && target !== field.current) return;
      if (document.querySelector('dialog[open]')) return;
      event.preventDefault();
      setHintSeen(true);
      if (open) close();
      else { setClosing(false); setOpen(true); }
    }
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [open, close]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!input.trim()) return;
    const command = input.trim();
    const result = runCommand(command, cwd, fs);
    if (result.kind === 'list' && result.revealedPaths?.length) {
      setKnownHidden(previous => new Set([...previous, ...result.revealedPaths!]));
    }
    let message: string | undefined;
    if (result.kind === 'execute' && result.file.action === 'unlock') {
      const id = result.file.discoveryId ?? '';
      const status = unlock(id);
      const title = discovery.items.find(item => item.id === id)?.text ?? result.file.name;
      message = status === 'invalid' ? copy.unsupportedFile : format(
        status === 'existing' ? discovery.alreadyUnlocked : discovery.unlocked, { title });
    }
    if (result.kind === 'cd') setCwd(result.path);
    if (result.kind === 'clear') setEntries([]);
    else setEntries(previous => [...previous, { id: nextId.current++, command, cwd, result, message }].slice(-copy.maxHistory));
    setHistory(previous => [...previous, command].slice(-copy.maxHistory));
    setInput(''); setHistoryIndex(-1); draft.current = ''; followOutput.current = true;
  }
  function keys(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (!history.length) return;
      if (historyIndex === -1) draft.current = input;
      const next = event.key === 'ArrowUp' ? Math.min(historyIndex + 1, history.length - 1) : Math.max(historyIndex - 1, -1);
      setHistoryIndex(next); setInput(next === -1 ? draft.current : history[history.length - 1 - next]);
    } else if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      const completed = completePath(input, cwd, fs, copy.commands.map(command => command.name), knownHidden);
      if (completed !== input) { setInput(completed); setHistoryIndex(-1); }
    }
  }
  return <>
      {(open || closing) && <section id="portfolio-terminal" role="dialog" aria-modal="false" aria-label={copy.title}
        className={`terminal ${closing ? 'terminal-closing' : 'terminal-opening'}`}
        onAnimationEnd={event => { if (event.target === event.currentTarget && closing) setClosing(false); }} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }}>
        <header className="terminal-bar"><span className="terminal-lights" aria-hidden="true"><i /><i /><i /></span><span>{copy.title}</span>
          <button className="icon-button" onClick={close} aria-label={copy.closeLabel}><X size={17} /></button>
        </header>
        <div ref={viewport} className="terminal-viewport" onScroll={() => {
          const element = viewport.current;
          if (element) followOutput.current = element.scrollHeight - element.scrollTop - element.clientHeight < 40;
        }}>
          <div ref={content}>
            <div className="terminal-intro"><TerminalIcon size={22} /><h2>{copy.welcome}</h2><p>{copy.intro}</p></div>
            <div role="log" aria-label={copy.outputLabel} aria-live="polite" aria-relevant="additions">
              {entries.map(entry => <div key={entry.id} className="terminal-entry">
                <p className="command-echo"><span>{copy.prompt}</span><span>{entry.cwd}</span>{copy.promptSymbol} {entry.command}</p>
                <TerminalOutput entry={entry} />
              </div>)}
            </div>
          </div>
        </div>
        <form className="terminal-input" onSubmit={submit}>
          <label htmlFor="terminal-command" className="sr-only">{copy.inputLabel}</label>
          <span className="terminal-path" title={cwd}>{cwd}</span><span aria-hidden="true">{copy.promptSymbol}</span>
          <input id="terminal-command" ref={field} value={input} onChange={event => { setInput(event.target.value); setHistoryIndex(-1); }}
            onKeyDown={keys} placeholder={copy.placeholder} autoComplete="off" autoCapitalize="off" spellCheck={false}
            maxLength={copy.maxInputLength} enterKeyHint="send" />
          <button className="icon-button" type="submit" aria-label={copy.submitLabel}><CornerDownLeft size={17} /></button>
        </form>
        <footer className="terminal-footer">{copy.footer}</footer>
      </section>}
    {!open && !hintSeen && <button className="terminal-nudge" onClick={() => { setHintSeen(true); setClosing(false); setOpen(true); }}>
      <span>{copy.suggestion}</span>
    </button>}
    <button ref={launcher} className="terminal-launcher" aria-label={open ? copy.closeLabel : copy.openLabel}
      title={copy.shortcutHint} aria-keyshortcuts="~" aria-expanded={open} aria-controls={open ? 'portfolio-terminal' : undefined}
      onClick={() => { setHintSeen(true); if (open) close(); else { setClosing(false); setOpen(true); } }}>
      <TerminalIcon size={19} /><span>{copy.launcher}</span><span className="status-dot" aria-hidden="true" />
    </button>
  </>;
}
