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

## Uploading and updating the site on GitHub Pages

Repository: [CodreaCodrin/CodreaCodrin.github.io](https://github.com/CodreaCodrin/CodreaCodrin.github.io).
Live site: [https://CodreaCodrin.github.io/](https://CodreaCodrin.github.io/).

This project already uses the `gh-pages` npm package. The source code stays on your normal development branch; the generated website is uploaded to the separate `gh-pages` branch. Use the following method with the existing scripts.

### First deployment or restoring the hosting configuration

1. Install Node.js and Git if needed. Use a supported Node release; Node 22.18+ is required by the current test command. Make sure Git can authenticate with your GitHub account.
2. Open PowerShell in `tcnsite`, or change directory explicitly:

   ```powershell
   Set-Location 'C:\Alpine Studio\Projects\PersonalSite\CodreaCodrin.github.io\tcnsite'
   npm ci
   npm test
   npm run deploy
   ```

   `npm ci` installs the dependencies from package-lock.json. `npm run deploy` automatically runs `predeploy`, which runs `npm run build` (TypeScript + Vite). It then uploads the **contents of dist** to the remote `gh-pages` branch. It creates that branch if necessary. If tests fail, fix them before running deploy. If the build fails, deployment stops.

3. Open the repository on GitHub, then **Settings > Pages > Build and deployment**. Set:

   - **Source:** Deploy from a branch
   - **Branch:** gh-pages
   - **Folder:** / (root)

   Click **Save**. If the branch is not listed, finish `npm run deploy` successfully and refresh the settings page. You normally configure this once. These are the settings for this repository's existing npm deployment method; a separate custom GitHub Actions deployment workflow is not required.

4. Check the repository's **Actions** tab for the Pages build/deployment result. Once it succeeds, visit https://CodreaCodrin.github.io/. Publication can take several minutes.

The repository is a user site at the domain root, so Vite's default `base: '/'` is correct. Do not change it to `/tcnsite/` or `/CodreaCodrin.github.io/`. The local folder name does not become part of the live URL. Routes retain the hash, for example `https://CodreaCodrin.github.io/#/manwa-manga-tierlist`.

### Every later update

1. Edit your source files, JSON content or images.
2. In GitHub Desktop, review your changes, write a commit message, click **Commit**, and **Push origin** on your normal source branch. This saves your editable project on GitHub.
3. In PowerShell, from `tcnsite`, run:

   ```powershell
   npm test
   npm run deploy
   ```

   If dependencies changed or node_modules is missing, run `npm ci` first. There is no need to run `npm run build` separately before deploy: predeploy already does that.

4. Wait for the Pages deployment to finish in GitHub's Actions tab, then refresh the live site. If it appears stale, use **Ctrl+F5** or a private browser window.

Pushing source commits alone does not update the live website with this manual deployment setup. `npm run deploy` uploads the production build; it does not commit or push your editable source changes. Keep both steps in your workflow. `npm run dev` and `npm run preview` only start local servers.

### Troubleshooting

- **Git authentication or push fails:** confirm you can push this repository with Git/GitHub Desktop and that origin points to `https://github.com/CodreaCodrin/CodreaCodrin.github.io.git`. Complete GitHub's sign-in flow if requested; never put credentials in project files.
- **Live site is blank or shows source files:** check Pages uses `gh-pages` and `/ (root)`, not the source branch. The branch should contain built index.html and assets directly at its root.
- **A page returns 404:** use the `/#/page-path` URL. The static host cannot serve React routes as real server directories.
- **Images fail only online:** check exact filename casing and ensure images are under public and included in the latest build/deploy.
- **Old design remains visible:** check the deployment result, refresh after it completes, and confirm you are viewing the live domain rather than localhost.
- **Build errors:** fix the displayed TypeScript/Vite errors before deploying. Keep package-lock.json with the source so installs remain reproducible.

Official references: [GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [Vite static deployment](https://vite.dev/guide/static-deploy).

## Content belongs in data/

The reading shelf is **Manhwa & Manga Tierlist**, at `/#/manwa-manga-tierlist`. Unlock it with `cd tierlists` followed by `./manwa-manga-tierlist`. The old `/#/manhwa-tierlist` URL redirects to the new URL, and the old terminal filename `manhwa_tierlist` remains an alias. The internal discovery ID stays `manhwa-tierlist` so existing visitors keep their unlocks. Both kinds of titles share `data/manhwaTierlist.json` and `public/tierlists/manhwa/`; those storage names do not limit the content.

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
./manwa-manga-tierlist
```

`cat`, `open`, `nano`, `vim`, and `./` all execute files. `ls` accepts optional paths; `cd` supports absolute/relative paths, `..`, `.`, `~`, and no argument (root). Commands support quoted paths, up/down history, Tab completion, `pwd`, `help`, and `clear`. This is a virtual shell: input is never passed to eval, the OS, or a real shell.

Discoveries add tiles to Home and the top-right menu with a short glitch. Executing a discovery never navigates. Unlocks are saved under the key configured in discovery.json, synchronized between tabs, and validated when loaded. Blocked storage falls back to in-memory state and reports that it cannot persist. Hidden routes show a discovery prompt until unlocked. This is a playful UI mechanic, not access control.

React components render account cards, links, directory listings, help and discovery notices; JSON is rendered as text, never injected as raw HTML. Terminal history is bounded and pending requests are canceled when their output unmounts.

## Account setup

Chess.com is connected directly to the public API using the username and endpoint in `data/consoleFS.json`. Executing `cat games_folder/chess_account` displays only Rapid and Blitz ratings plus the total games played across every chess mode returned by the API (wins, losses and draws included). Missing ratings display `Not played`. Chess.com may refresh its published data only once every 24 hours; these are the latest API values, not an instant match feed. The browser caches successful results for five minutes.

Riot displays only Solo/Duo rank, Flex rank and their combined current ranked game count (wins + losses from LEAGUE-V4). Its endpoint is intentionally empty until a separate secure Cloudflare Worker is configured. No preview ratings are presented as live data. **EUNE is a provisional default and must be checked.** Follow [the complete Riot activation guide](integrations/riot/README.md) to add a secret, deploy the Worker and connect its public URL. Never add a Riot key to frontend JSON or a Vite environment variable.

All account IDs/descriptions/endpoints remain in `data/consoleFS.json`; labels, provider settings, API paths, caching and notices are in `data/accountStats.json`. Steam remains an immediate profile link. Custom public HTTPS endpoints can return `{ "stats": [{ "label": "Rank", "value": "Gold" }] }` for non-Chess providers. HTTP errors, malformed responses, timeouts and cancellation are handled by the adapter.

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

Manhwa and manga entries also include `rating` from 0 to 5 in steps of 0.5. Omit a description to make a card non-interactive. Set `sample: false` or omit it on real entries.

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
- `src/services`: public statistics API integration
- `src/components/collections`: reusable cards, images, ratings and description view
- `src/components/navigation`: shared navigation, return links and social links
- `src/components/layout`: panels and background layers

Native modal dialogs handle focus containment and Escape for menus/descriptions. The terminal is non-modal so visitors can see the discovery change on the website and interact with unlocked links. It focuses the input when opened and restores focus to its launcher when closed. Navigation uses real links, route changes focus main content, ratings have accessible text, and reduced-motion preferences disable decorative effects.

Both original themes are preserved, with an additional daylight palette. CSS transitions animate actual color properties; background images crossfade instead of attempting to transition background-image.

For complete editing and page creation instructions, see [PAGE_GUIDE.md](./PAGE_GUIDE.md).
