import type { Stat } from '../components/command/fileSystem';

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
const count = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;

export function parseStatsEnvelope(body: unknown): Stat[] | null {
  if (!object(body) || !Array.isArray(body.stats) || !body.stats.length) return null;
  return body.stats.every(item => object(item) && typeof item.label === 'string' &&
    (typeof item.value === 'string' || (typeof item.value === 'number' && Number.isFinite(item.value)))) ? body.stats as Stat[] : null;
}

export function parseChessStats(body: unknown, modes: { key: string; label: string }[], labels: { games: string }, unplayed: string): Stat[] | null {
  if (!object(body) || 'error' in body || !Object.keys(body).some(key => key.startsWith('chess_') || key === 'tactics' || key === 'puzzle_rush')) return null;
  let games = 0;
  // Include every game mode supplied by Chess.com, even when its rating is not displayed.
  for (const [key, mode] of Object.entries(body)) {
    if (!key.startsWith('chess_') || !object(mode) || !object(mode.record)) continue;
    for (const result of ['win', 'loss', 'draw']) {
      const value = mode.record[result];
      if (count(value)) games += value;
    }
  }
  const stats: Stat[] = modes.map(({ key, label }) => {
    const mode = body[key];
    if (!object(mode)) return { label, value: unplayed };
    return { label, value: object(mode.last) && count(mode.last.rating) ? mode.last.rating : unplayed };
  });
  return [...stats, { label: labels.games, value: games }];
}
