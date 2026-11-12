import { useEffect, useState } from 'react';
import { ExternalLink, LoaderCircle } from 'lucide-react';
import type { ConsoleFile } from './fileSystem';
import { fetchAccountStats, type StatsResult } from '../../services/accountStats';
import { safeExternalUrl } from '../../lib/format';
import copy from '../../../data/console.json';

export default function AccountOutput({ file }: { file: ConsoleFile }) {
  const [result, setResult] = useState<StatsResult | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (file.action !== 'account') return;
    const controller = new AbortController();
    void fetchAccountStats(file, controller.signal)
      .then(value => { if (!controller.signal.aborted) setResult(value); })
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, [file]);
  const href = safeExternalUrl(file.profileUrl);
  return <article className="account-output">
    <div className="account-heading"><strong>{file.title}</strong><span>{file.accountId || copy.missingAccount}</span></div>
    <p>{file.description}</p>
    {file.action === 'account' && <div role="status">
      {error ? <p className="terminal-error">{copy.fetchError}</p> : result ? <>
        <span className="eyebrow">{result.mode === 'preview' ? copy.mockLabel : copy.liveLabel}</span>
        <dl className="stats-grid">{result.stats.map(stat => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl>
      </> : <p className="loading-stats"><LoaderCircle size={14} className="spin" />{copy.loadingStats}</p>}
    </div>}
    {href ? <a className="text-link" href={href} target="_blank" rel="noopener noreferrer">{copy.profileLink}<ExternalLink size={13} /></a>
      : file.action === 'profile' ? <p className="muted">{copy.missingProfile}</p> : null}
  </article>;
}
