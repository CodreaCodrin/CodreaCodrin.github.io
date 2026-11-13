// A fixed-account adapter, never an arbitrary URL/account proxy. No secret is returned.
export function createRiotHandler(config, account, requestApi = fetch) {
  let saved, pending, cooldownUntil = 0;
  const fill = (template, values) => template.replace(/\{(\w+)\}/g, (_, key) => encodeURIComponent(values[key]));
  async function load(key) {
    const signal = AbortSignal.timeout(config.timeoutMs);
    const call = async (route, path) => {
      const response = await requestApi(config.apiBase.replace('{route}', route) + path, {
        headers: { 'X-Riot-Token': key, Accept: 'application/json' }, signal,
      });
      if (!response.ok) {
        if (response.status === 429) {
          const seconds = Number(response.headers.get('Retry-After'));
          cooldownUntil = Date.now() + Math.max(60, Number.isFinite(seconds) ? seconds : 60) * 1000;
        }
        throw response.status;
      }
      return response.json();
    };
    const separator = account.accountId.lastIndexOf('#');
    const name = account.accountId.slice(0, separator).trim(), tag = account.accountId.slice(separator + 1).trim();
    if (separator < 1 || !name || !tag) throw 503;
    const identity = await call(config.region, fill(config.accountPath, { name, tag }));
    if (typeof identity.puuid !== 'string' || !identity.puuid) throw 502;
    const leagues = await call(config.platform, fill(config.leaguePath, identity));
    if (!Array.isArray(leagues)) throw 502;
    const stats = [];
    let games = 0;
    for (const queue of config.queues) {
      const league = leagues.find(item => item.queueType === queue.key);
      if (!league) { stats.push({ label: queue.label, value: config.labels.unranked }); continue; }
      if (typeof league.tier !== 'string' || typeof league.rank !== 'string' ||
          ![league.wins, league.losses].every(value => Number.isInteger(value) && value >= 0)) throw 502;
      games += league.wins + league.losses;
      stats.push({ label: queue.label, value: `${league.tier} ${league.rank}` });
    }
    stats.push({ label: config.labels.games, value: games });
    return { stats };
  }
  return async function handle(request, env, edgeCache) {
    const origin = request.headers.get('Origin');
    const allowed = !origin || config.allowedOrigins.includes(origin.toLowerCase());
    const headers = { Vary: 'Origin', 'Cache-Control': 'no-store', 'Content-Type': 'application/json' };
    if (allowed && origin) headers['Access-Control-Allow-Origin'] = origin;
    const reply = (status, body = { status }) => Response.json(body, { status, headers });
    if (!allowed) return reply(403);
    if (new URL(request.url).pathname !== config.path || new URL(request.url).search) return reply(404);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: {
      ...headers, 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Accept',
    } });
    if (request.method !== 'GET') return reply(405);
    if (!env.RIOT_API_KEY) return reply(503);
    // Include account/server in the cache key so configuration changes cannot show old accounts.
    const cacheUrl = new URL(request.url);
    cacheUrl.searchParams.set('account', account.accountId);
    cacheUrl.searchParams.set('platform', config.platform);
    cacheUrl.searchParams.set('region', config.region);
    cacheUrl.searchParams.set('format', 'rank-summary-v2');
    const cacheKey = new Request(cacheUrl.href);
    try {
      const hit = await edgeCache?.match(cacheKey);
      if (hit) return reply(200, await hit.json());
      if (saved?.expires > Date.now()) return reply(200, saved.body);
      if (cooldownUntil > Date.now()) return new Response(JSON.stringify({ status: 429 }), {
        status: 429, headers: { ...headers, 'Retry-After': String(Math.ceil((cooldownUntil - Date.now()) / 1000)) },
      });
      pending ??= load(env.RIOT_API_KEY).then(body => {
        saved = { body, expires: Date.now() + config.cacheSeconds * 1000 };
        return body;
      }).finally(() => { pending = undefined; });
      const body = await pending;
      if (edgeCache) await edgeCache.put(cacheKey, Response.json(body, {
        headers: { 'Cache-Control': `public, max-age=${config.cacheSeconds}` },
      })).catch(() => {});
      return reply(200, body);
    } catch (error) {
      return reply([403, 404, 429, 503].includes(error) ? error : 502);
    }
  };
}
