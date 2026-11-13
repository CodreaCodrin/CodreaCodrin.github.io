# Riot statistics service

The portfolio remains a static GitHub Pages site. Chess.com is called directly from the browser. Riot needs this separate, small Cloudflare Worker because a secret cannot be kept in browser code. The Worker only serves the Riot account from `data/consoleFS.json`; visitors cannot supply another account, API path or key.

## Activate later

1. Sign in at https://developer.riotgames.com/ and get an API key. A development key expires every 24 hours and is for development, not a permanent public deployment. Riot's portal lists displaying your own statistics on a personal website as an example for a personal key; follow their current approval requirements for your use case.
2. Verify `accountId` for `riot_account` in `data/consoleFS.json`. Its existing value has been preserved. The adapter splits at `#`, trims surrounding spaces and URL-encodes the name/tag, including Romanian characters.
3. Verify `riot.platform` in `data/accountStats.json`: **`eun1` (EUNE) is a provisional default, not a verified account region**. Use `euw1` for EUW. `riot.region` is `europe` for these two platforms. Other platforms need the appropriate regional route from Riot's routing documentation.
4. Create a Cloudflare account with Workers enabled. In a terminal, starting in `tcnsite`, run:

   ```powershell
   cd integrations/riot
   npx wrangler@4 login
   npx wrangler@4 deploy
   npx wrangler@4 secret put RIOT_API_KEY
   ```

   Paste the key **only into the secret command's interactive prompt**. The first deploy returns 503 until this secret is added. Never put the key in `consoleFS.json`, a `VITE_*` variable, a committed file, or the portfolio bundle. To renew a key, repeat `secret put`. No key needs to be sent in chat.

5. Copy the Worker URL printed by Wrangler and append `/stats/riot`, for example `https://miel-riot-stats.YOUR-SUBDOMAIN.workers.dev/stats/riot`. Put that full URL in the Riot file's `endpoint` in `data/consoleFS.json`. This URL is public; it is not a secret. Do not add the key to it.
6. Open that URL: it should return `{ "stats": [...] }`. Then test `cat games_folder/riot_account` in the portfolio terminal. Before activation, the terminal shows a configuration message rather than invented ratings.
7. From `tcnsite`, run `npm test`, then `npm run deploy` to update GitHub Pages. If account, region, labels or Worker code change later, also rerun `npx wrangler@4 deploy` from this directory. Updating GitHub Pages alone does not redeploy the Worker.

## Behavior and troubleshooting

- ACCOUNT-V1 resolves the configured Riot ID to a PUUID using the regional route. LEAGUE-V4 then loads ranked entries using the platform route. Only Solo/Duo rank, Flex rank and their combined game count are displayed. The count sums wins + losses for these two queues in Riot's current ranked record; it follows Riot's ranked resets, rather than filtering historical matches by calendar dates. Unranked queues display `Unranked`; a queue missing from the response contributes zero games (for example, an account without a published rank). Level, LP, win rate and separate win/loss figures are not displayed; no MMR is inferred.
- Successful responses are cached for five minutes in the Worker isolate and Cloudflare's edge cache. Concurrent requests within one isolate share the same upstream work. The browser also caches results for five minutes; Riot itself can update data on its own schedule. This is API-backed data, not a real-time match stream.
- A 429 starts a cooldown honoring `Retry-After` (at least 60 seconds) within the Worker isolate. Errors are not stored as successful data. There is no automatic retry loop. Edge caching is not a global rate limiter; configure Cloudflare rate limiting if traffic grows.
- Only GET and OPTIONS at the configured path are accepted. CORS allows the GitHub Pages origin and local Vite origins listed in JSON. CORS is a browser access rule, not authentication. This endpoint intentionally exposes only your public account statistics; it cannot be used as an arbitrary Riot proxy.
- 403: key invalid/expired or permission missing. 404: check Riot ID, platform and account availability. 429: wait before trying again. 503: missing secret/configuration. 502: unexpected upstream response, outage or timeout. Provider bodies and keys are never forwarded to the browser.
- The default local origins use port 5173. Add your actual origin to `riot.allowedOrigins` if necessary; redeploy the Worker afterward.
- The account description appears immediately. Statistics requests start immediately; the artificial delay is disabled (`console.fetchDelayMs` is 0). Leaving/clearing terminal output cancels its browser request.

## Official references

- Chess.com: https://www.chess.com/news/view/published-data-api
- Riot keys and rate limits: https://developer.riotgames.com/docs/portal
- Riot ID and platform routing: https://developer.riotgames.com/docs/lol
- Riot API reference: https://developer.riotgames.com/apis/
- Riot key safety: https://support-developer.riotgames.com/hc/en-us/articles/22698591841939-General-Policies
- Cloudflare secrets: https://developers.cloudflare.com/workers/configuration/secrets/
