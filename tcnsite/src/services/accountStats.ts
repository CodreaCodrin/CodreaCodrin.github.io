import type { ConsoleFile, Stat } from '../components/command/fileSystem';
import copy from '../../data/console.json' with { type: 'json' };
import config from '../../data/accountStats.json' with { type: 'json' };
import { safeExternalUrl } from '../lib/format.ts';
import { parseChessStats, parseStatsEnvelope } from './statsParsers.ts';
export interface StatsResult { mode: 'live' | 'unconfigured'; stats: Stat[]; note: string }
const cache = new Map<string, { expires: number; result: StatsResult }>();

function delay(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) { reject(signal.reason); return; }
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(); }, milliseconds);
    signal.addEventListener('abort', abort, { once: true });
  });
}

export async function fetchAccountStats(account: ConsoleFile, signal: AbortSignal): Promise<StatsResult> {
  await delay(copy.fetchDelayMs, signal);
  if (!account.accountId) throw new Error(copy.missingAccount);
  if (!account.endpoint) return { mode: 'unconfigured', stats: [], note: config.messages.notConfigured };
  const endpoint = safeExternalUrl(account.endpoint.replaceAll('{accountId}', encodeURIComponent(account.accountId.trim().toLowerCase())));
  if (!endpoint || new URL(endpoint).protocol !== 'https:') throw new Error(copy.fetchError);
  const cached = cache.get(endpoint);
  if (cached && cached.expires > Date.now()) return cached.result;
  const response = await fetch(endpoint, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(copy.fetchTimeoutMs)]),
    credentials: 'omit', headers: { Accept: 'application/json' },
  }).catch(() => { throw new Error(copy.fetchError); });
  if (!response.ok) {
    const message = config.messages.http[String(response.status) as keyof typeof config.messages.http];
    throw new Error(message || copy.fetchError);
  }
  const body: unknown = await response.json().catch(() => { throw new Error(copy.invalidResponse); });
  const stats = account.provider === 'chess'
    ? parseChessStats(body, config.chess.modes, config.chess.labels, config.messages.unplayed)
    : parseStatsEnvelope(body);
  if (!stats) throw new Error(copy.invalidResponse);
  const result: StatsResult = { mode: 'live', stats, note: account.provider === 'chess' ? config.chess.note : config.riot.note };
  cache.set(endpoint, { expires: Date.now() + config.cacheMs, result });
  return result;
}
