import { useEffect, useState } from 'react';
import { ExternalLink, LoaderCircle } from 'lucide-react';
import type { ConsoleFile } from './fileSystem';
import { fetchAccountStats, type StatsResult } from '../../services/accountStats';
import { safeExternalUrl } from '../../lib/format';
import copy from '../../../data/console.json';

export default function AccountOutput({ file }: { file: ConsoleFile }) {
  const [result, setResult] = useState<StatsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (file.action !== 'account') return;
    const controller = new AbortController();
    void fetchAccountStats(file, controller.signal)
      .then(value => { if (!controller.signal.aborted) setResult(value); })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error && reason.message ? reason.message : copy.fetchError);
      });
    return () => controller.abort();
  }, [file]);
  const href = safeExternalUrl(file.profileUrl);
  return <article className="account-output">
    <div className="account-heading"><strong>{file.title}</strong><span>{file.accountId || copy.missingAccount}</span></div>
    <p>{file.description}</p>
    {file.action === 'account' && <div role="status">
      {error ? <p className="terminal-error">{error}</p> : result ? <>
        {result.mode === 'live' && <><span className="eyebrow">{copy.liveLabel}</span>
        <dl className="stats-grid">{result.stats.map(stat => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}</dl></>}
        {result.note && <p className="muted">{result.note}</p>}
      </> : <p className="loading-stats"><LoaderCircle size={14} className="spin" />{copy.loadingStats}</p>}
    </div>}
    {href ? <a className="text-link" href={href} target="_blank" rel="noopener noreferrer">{copy.profileLink}<ExternalLink size={13} /></a>
      : file.action === 'profile' ? <p className="muted">{copy.missingProfile}</p> : null}
  </article>;
}
