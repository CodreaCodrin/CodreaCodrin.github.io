# Miel — personal portfolio

React 19 + TypeScript + Vite, TanStack Router, Tailwind CSS, and Framer Motion. Everything runs in the browser; no Node server is needed in production.

## Local workflow

Run from this directory:

- `npm install` (only when dependencies are missing)
- `npm run dev`
- `npm test` — behavioral tests using Node's test runner (Node 22.18+)
- `npm run build` — TypeScript checks and static production output
- `npm run preview` — serve the production build
- `npm run deploy` — build and publish `dist` with the existing gh-pages setup

Routes use hash history, for example `/#/art-gallery`. This makes direct links and refreshes work on GitHub Pages without server rewrites. Existing navigation paths are retained after the hash. Old external links such as `/aboutme` still need to be updated to `/#/aboutme`.

## Content belongs in data/

| File | Content |
| --- | --- |
| site.json | Existing page copy, brand, navigation, social URLs, accessible labels |
| projects.json / tagColors.json | Projects and technology colors |
| themes.json | Theme names, palettes, background paths, persistence key |
| console.json | Command help, prompts, errors, timing and output limits |
| consoleFS.json | Virtual filesystem, account IDs/descriptions, profile URLs, public API endpoints |
| discovery.json | Unlock IDs, navigation tiles, storage key, notifications |
| artGallery.json | Gallery copy and artwork entries |
| manhwaTierlist.json | Reading shelf copy, covers, half-star ratings |
| collections.json | Shared card labels, image sizes and rating text |

Sample collection entries are explicitly labeled. Replace them with your own images and text, or set `items` to an empty array for an intentional empty state. No personal account IDs or artwork were invented.

## Terminal and discovery

Try:

```sh
ls
cd games_folder
cat riot_account
open chess_account
./steam_account
cd ..
./art_gallery
cd tierlists
./manhwa_tierlist
```

`cat`, `open`, and `./` all execute files. `ls` accepts optional paths; `cd` supports absolute/relative paths, `..`, `.`, `~`, and no argument (root). Commands support quoted paths, up/down history, Tab completion, `pwd`, `help`, and `clear`. This is a virtual shell: input is never passed to eval, the OS, or a real shell.

Discoveries add tiles to Home and the top-right menu with a short glitch. Executing a discovery never navigates. Unlocks are saved under the key configured in discovery.json, synchronized between tabs, and validated when loaded. Blocked storage falls back to in-memory state and reports that it cannot persist. Hidden routes show a discovery prompt until unlocked. This is a playful UI mechanic, not access control.

React components render account cards, links, directory listings, help and discovery notices; JSON is rendered as text, never injected as raw HTML. Terminal history is bounded and pending requests are canceled when their output unmounts.

## Account setup

Set each account's `accountId` and, for Steam, `profileUrl` in consoleFS.json. The profile action renders the description/link immediately. Riot and chess render their descriptions immediately and wait 1 second before returning explicitly labeled preview stats.

To connect real statistics, set `endpoint` to an HTTPS, CORS-enabled public endpoint containing `{accountId}`. The account ID is URL-encoded and substituted by `src/services/accountStats.ts`. The expected response is:

```json
{ "stats": [{ "label": "Rapid", "value": 1500 }] }
```

The adapter validates responses and handles HTTP errors, request timeout and cancellation. Map provider-specific responses in this service when adding the actual API. Never put private API keys in JSON or client code: use a public feed, build-time data, or a separately hosted proxy for APIs requiring secrets. No live API is configured by default.

## Images

Put artwork in `public/artGallery/` and covers in `public/tierlists/manhwa/`. Reference filenames relative to the respective JSON `assetDirectory`.

An entry can look like:

```json
{
  "id": "my-piece",
  "title": "My piece",
  "image": "my-piece-800.jpg",
  "alt": "Describe the actual artwork",
  "width": 800,
  "height": 1000,
  "srcSet": "my-piece-400.jpg 400w, my-piece-800.jpg 800w",
  "sources": [
    { "type": "image/avif", "srcSet": "my-piece-400.avif 400w, my-piece-800.avif 800w" },
    { "type": "image/webp", "srcSet": "my-piece-400.webp 400w, my-piece-800.webp 800w" }
  ],
  "description": "Optional story behind this piece."
}
```

Manhwa entries also include `rating` from 0 to 5 in steps of 0.5. Omit a description to make a card non-interactive. Set `sample: false` or omit it on real entries.

Image strategy:
- Native `loading="lazy"` for below-the-fold images, with eager/high-priority loading for the first potential LCP image.
- Explicit dimensions and aspect ratios reserve space to prevent layout shifts.
- Asynchronous decoding and a short opacity reveal.
- Optional AVIF/WebP `picture` sources and width-based `srcSet`/`sizes` let browsers download the appropriate resolution.
- Missing images have a stable, accessible fallback.
- Small collection views are bundled with the app to avoid a separate route-loading failure; image bytes still load on demand.
- JSON is metadata only; image bytes stay out of JavaScript.

Export the actual responsive variants before referencing them. The app does not pretend to resize/compress originals at runtime, and no image optimization service is required.

Backgrounds load only when their theme is first needed, decode before display, and crossfade as fixed compositor-friendly layers. Other themes' backgrounds are not eagerly downloaded. Collection views fade all background imagery to zero opacity, leaving the solid theme color. Cached images can be reused when returning home.

## Structure and accessibility

- `src/components/command`: pure filesystem/command engine, terminal UI, rich output
- `src/context`: shared discovery state
- `src/services`: future public statistics API integration
- `src/components/collections`: reusable cards, images, ratings and description view
- `src/components/navigation`: shared navigation, return links and social links
- `src/components/layout`: panels and background layers

Native modal dialogs handle focus containment and Escape for menus/descriptions. The terminal is non-modal so visitors can see the discovery change on the website and interact with unlocked links. It focuses the input when opened and restores focus to its launcher when closed. Navigation uses real links, route changes focus main content, ratings have accessible text, and reduced-motion preferences disable decorative effects.

Both original themes are preserved, with an additional daylight palette. CSS transitions animate actual color properties; background images crossfade instead of attempting to transition background-image.
