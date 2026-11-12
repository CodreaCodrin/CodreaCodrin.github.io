import type { ConsoleFile, Stat } from '../components/command/fileSystem';
import copy from '../../data/console.json';
import { safeExternalUrl } from '../lib/format';
export interface StatsResult { mode: 'preview' | 'live'; stats: Stat[] }

function delay(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return; }
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, milliseconds);
    signal.addEventListener('abort', abort, { once: true });
  });
}

// Adapter boundary: configure a PUBLIC, CORS-enabled endpoint with {accountId}.
// Never ship Riot/Steam secrets in client JSON. Use a public precomputed feed or an external proxy.
export async function fetchAccountStats(account: ConsoleFile, signal: AbortSignal): Promise<StatsResult> {
  await delay(copy.fetchDelayMs, signal);
  if (!account.endpoint || !account.accountId) return { mode: 'preview', stats: account.mockStats ?? [] };
  const endpoint = safeExternalUrl(account.endpoint.replaceAll('{accountId}', encodeURIComponent(account.accountId)));
  if (!endpoint) throw new Error(copy.fetchError);
  const response = await fetch(endpoint, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(copy.fetchTimeoutMs)]),
    credentials: 'omit',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(copy.fetchError);
  const body: unknown = await response.json();
  if (!body || typeof body !== 'object' || !('stats' in body) || !Array.isArray(body.stats) ||
      !body.stats.every((item: unknown) => item && typeof item === 'object' && 'label' in item && 'value' in item &&
        typeof item.label === 'string' && (typeof item.value === 'string' || typeof item.value === 'number')))
    throw new Error(copy.invalidResponse);
  return { mode: 'live', stats: body.stats as Stat[] };
}
