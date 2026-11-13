import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseChessStats, parseStatsEnvelope } from '../src/services/statsParsers.ts';
import { fetchAccountStats } from '../src/services/accountStats.ts';
import { createRiotHandler } from '../integrations/riot/handler.mjs';

const config = JSON.parse(readFileSync(new URL('../data/accountStats.json', import.meta.url)));
const filesystem = JSON.parse(readFileSync(new URL('../data/consoleFS.json', import.meta.url)));
const riot = filesystem.children[0].children.find(file => file.provider === 'riot');
const parseChess = body => parseChessStats(body, config.chess.modes, config.chess.labels, config.messages.unplayed);
const fixture = { chess_rapid: { last: { rating: 1104 }, record: { win: 8, loss: 5, draw: 2 } }, chess_blitz: { last: { rating: 757 }, record: { win: 2, loss: 1, draw: 2 } } };

test('Chess displays only Rapid, Blitz and total games, including hidden ratings and draws', () => {
  const stats = parseChess({ ...fixture, chess_bullet: { record: { win: 3, loss: 4, draw: 1 } }, chess_daily: { record: { win: 2, loss: 1, draw: 0 } } });
  const values = Object.fromEntries(stats.map(stat => [stat.label, stat.value]));
  assert.equal(stats.length, 3);
  assert.equal(values.Rapid, 1104);
  assert.equal(values.Blitz, 757);
  assert.equal(values.Bullet, undefined);
  assert.equal(values.Daily, undefined);
  assert.equal(values[config.chess.labels.games], 31);
});

test('Chess missing ratings and malformed payloads do not produce fake numeric ratings', () => {
  const stats = parseChess({ puzzle_rush: {} });
  assert.equal(stats[0].value, config.messages.unplayed);
  assert.equal(stats.at(-1).value, 0);
  for (const body of [null, [], { error: 'missing' }, { stats: [] }]) assert.equal(parseChess(body), null);
  assert.equal(parseStatsEnvelope({ stats: [{ label: 'rank', value: NaN }] }), null);
  assert.equal(parseStatsEnvelope({ stats: [{ label: 'rank', value: {} }] }), null);
});

test('browser adapter fetches encoded Chess username, caches results and omits credentials', async t => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls++;
    assert.equal(url, 'https://api.chess.com/pub/player/test%20user/stats');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.headers['X-Riot-Token'], undefined);
    return Response.json(fixture);
  });
  const file = { provider: 'chess', accountId: 'Test User', endpoint: 'https://api.chess.com/pub/player/{accountId}/stats' };
  const first = await fetchAccountStats(file, new AbortController().signal);
  const second = await fetchAccountStats(file, new AbortController().signal);
  assert.equal(first.mode, 'live');
  assert.deepEqual(first, second);
  assert.equal(calls, 1);
});

test('browser adapter handles rate limits, malformed JSON, missing Riot endpoint and cancellation', async t => {
  const signal = new AbortController().signal;
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 429 }));
  await assert.rejects(fetchAccountStats({ accountId: 'user', endpoint: 'https://example.com/limited' }, signal), { message: config.messages.http['429'] });
  globalThis.fetch = async () => new Response('not json');
  await assert.rejects(fetchAccountStats({ accountId: 'user', endpoint: 'https://example.com/invalid' }, signal));
  const result = await fetchAccountStats({ ...riot, endpoint: '' }, signal);
  assert.equal(result.mode, 'unconfigured');
  assert.deepEqual(result.stats, []);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(fetchAccountStats(riot, controller.signal), { name: 'AbortError' });
});

const request = (path = config.riot.path, origin = config.riot.allowedOrigins[0], method = 'GET') => new Request('https://stats.example' + path, { method, headers: { Origin: origin } });
const upstream = (leagues = []) => [ { puuid: 'public-puuid' }, leagues ];

test('Riot resolves Unicode ID through regional and platform routes, shares concurrent work and caches without exposing secret', async () => {
  const urls = [], answers = upstream([{ queueType: 'RANKED_SOLO_5x5', tier: 'GOLD', rank: 'II', leaguePoints: 42, wins: 7, losses: 3 }]);
  const handler = createRiotHandler(config.riot, riot, async (url, options) => {
    urls.push(url);
    assert.equal(options.headers['X-Riot-Token'], 'server-only-test-secret');
    return Response.json(answers.shift());
  });
  const responses = await Promise.all([handler(request(), { RIOT_API_KEY: 'server-only-test-secret' }), handler(request(), { RIOT_API_KEY: 'server-only-test-secret' })]);
  assert.equal(urls.length, 2);
  const [name, tag] = riot.accountId.split('#').map(value => value.trim());
  assert.ok(urls[0].includes(`/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`));
  assert.ok(urls[0].startsWith('https://europe.api.riotgames.com/'));
  assert.ok(urls[1].includes('/lol/league/v4/entries/by-puuid/public-puuid'));
  const text = await responses[0].text();
  assert.ok(!text.includes('server-only-test-secret'));
  const body = JSON.parse(text);
  assert.deepEqual(body.stats, [
    { label: config.riot.queues[0].label, value: 'GOLD II' },
    { label: config.riot.queues[1].label, value: config.riot.labels.unranked },
    { label: config.riot.labels.games, value: 10 },
  ]);
  assert.ok(body.stats.some(stat => stat.value === config.riot.labels.unranked));
  assert.equal(responses[0].headers.get('Access-Control-Allow-Origin'), config.riot.allowedOrigins[0]);
  assert.equal((await handler(request(), { RIOT_API_KEY: 'server-only-test-secret' })).status, 200);
  assert.equal(urls.length, 2);
});

test('Riot sums wins and losses across Solo/Duo and Flex only, with no level or LP output', async () => {
  const answers = upstream([
    { queueType: 'RANKED_SOLO_5x5', tier: 'GOLD', rank: 'II', wins: 7, losses: 3 },
    { queueType: 'RANKED_FLEX_SR', tier: 'SILVER', rank: 'I', wins: 11, losses: 9 },
    { queueType: 'OTHER_QUEUE', tier: 'GOLD', rank: 'II', wins: 100, losses: 100 },
  ]);
  const handler = createRiotHandler(config.riot, riot, async () => Response.json(answers.shift()));
  const body = await (await handler(request(), { RIOT_API_KEY: 'test' })).json();
  assert.deepEqual(body.stats, [
    { label: config.riot.queues[0].label, value: 'GOLD II' },
    { label: config.riot.queues[1].label, value: 'SILVER I' },
    { label: config.riot.labels.games, value: 30 },
  ]);
});

test('Riot validates origins, paths, methods and missing secret before upstream access', async () => {
  const handler = createRiotHandler(config.riot, riot, () => { assert.fail('must not fetch'); });
  assert.equal((await handler(request(), {})).status, 503);
  assert.equal((await handler(request(undefined, 'https://untrusted.example'), {})).status, 403);
  assert.equal((await handler(request('/stats/riot?account=someone-else'), {})).status, 404);
  assert.equal((await handler(request(undefined, undefined, 'POST'), {})).status, 405);
  assert.equal((await handler(request(undefined, undefined, 'OPTIONS'), {})).status, 204);
});

test('Riot rate limit honors cooldown, forwards no provider error body and does not retry', async () => {
  let calls = 0;
  const handler = createRiotHandler(config.riot, riot, async () => {
    calls++;
    return Response.json({ private: 'provider detail' }, { status: 429, headers: { 'Retry-After': '120' } });
  });
  const first = await handler(request(), { RIOT_API_KEY: 'test' });
  assert.equal(first.status, 429);
  assert.ok(!(await first.text()).includes('provider detail'));
  const second = await handler(request(), { RIOT_API_KEY: 'test' });
  assert.equal(second.status, 429);
  assert.ok(Number(second.headers.get('Retry-After')) >= 119);
  assert.equal(calls, 1);
});

test('Riot rejects malformed upstream statistics rather than caching invented data', async () => {
  let calls = 0;
  const handler = createRiotHandler(config.riot, riot, async () => {
    calls++;
    return Response.json(calls % 2 ? { puuid: 'id' } : { invalid: 'not ranked entries' });
  });
  assert.equal((await handler(request(), { RIOT_API_KEY: 'test' })).status, 502);
});
