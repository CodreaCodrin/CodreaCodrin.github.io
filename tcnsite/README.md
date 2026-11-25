# Miel — personal portfolio

React 19 + TypeScript + Vite, TanStack Router, Tailwind CSS, and native CSS animations. Everything runs in the browser; no Node server is needed in production.

Pentru poze și cover-uri noi: **[ghid pas cu pas, în română](IMAGES_GUIDE.md)**. Adaugi originalul și un obiect în JSON; variantele optimizate se generează automat.

## Local workflow

Run from this directory:

- `npm install` (only when dependencies are missing)
- `npm run optimize:images` (after adding/replacing images or image entries, before dev/tests)
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
   npm run optimize:images
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

The repository is a user site at the domain root, so Vite's default `base: '/'` is correct. Do not change it to `/tcnsite/` or `/CodreaCodrin.github.io/`. The local folder name does not become part of the live URL. Routes retain the hash, for example `https://CodreaCodrin.github.io/#/manga-tierlist`.

### Every later update

1. Editează sursa, JSON-ul sau imaginile originale. Pentru poze, urmează [IMAGES_GUIDE.md](IMAGES_GUIDE.md).
2. Deschide PowerShell în `tcnsite/`. Dacă dependențele s-au schimbat sau lipsește node_modules, rulează `npm ci` înainte de pașii următori.
3. Generează variantele **înainte de teste**, apoi verifică proiectul:

   ```powershell
   npm run optimize:images
   npm test
   ```

4. În GitHub Desktop verifică și salvează prin **Commit + Push** sursa, JSON-ul, originalele, `data/imageVariants.json` și modificările din `public/optimized/`. Optimizarea trebuie făcută înainte de acest commit pentru a include și fișierele generate.
5. Din `tcnsite/`, rulează `npm run deploy`. Comanda construiește și publică site-ul; build-ul rulează automat optimizarea încă o dată, reutilizând imaginile neschimbate.
6. Verifică publicarea în tabul Actions de pe GitHub, apoi reîncarcă site-ul. Dacă apare versiunea veche, încearcă Ctrl+F5.

Push-ul sursei și publicarea site-ului sunt operații separate. `npm run dev` și `npm run preview` pornesc servere locale și nu publică nimic. Pentru build/publicare nu trebuie să rulezi separat `npm run build` înainte de deploy.

### Troubleshooting

- **Git authentication or push fails:** confirm you can push this repository with Git/GitHub Desktop and that origin points to `https://github.com/CodreaCodrin/CodreaCodrin.github.io.git`. Complete GitHub's sign-in flow if requested; never put credentials in project files.
- **Live site is blank or shows source files:** check Pages uses `gh-pages` and `/ (root)`, not the source branch. The branch should contain built index.html and assets directly at its root.
- **A page returns 404:** use the `/#/page-path` URL. The static host cannot serve React routes as real server directories.
- **Images fail only online:** check exact filename casing and ensure images are under public and included in the latest build/deploy.
- **Old design remains visible:** check the deployment result, refresh after it completes, and confirm you are viewing the live domain rather than localhost.
- **Build errors:** fix the displayed TypeScript/Vite errors before deploying. Keep package-lock.json with the source so installs remain reproducible.

Official references: [GitHub Pages publishing source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [Vite static deployment](https://vite.dev/guide/static-deploy).

## Content belongs in data/

The two reading shelves are **Manga Tierlist** at `/#/manga-tierlist` and **Manhwa Tierlist** at `/#/manhwa-tierlist`. In the terminal, run `ls -a tierlists` to reveal both hidden files, then click either file to unlock its page. You can also run `cd tierlists` and execute `./manga-tierlist` or `./manhwa-tierlist`. The old combined URL and terminal aliases lead to Manhwa Tierlist. Existing unlocks still apply to that page.

| File | Content |
| --- | --- |
| site.json | Existing page copy, brand, navigation, social URLs, accessible labels |
| projects.json / tagColors.json | Projects and technology colors |
| themes.json | Theme names, palettes, background intensity, persistence key |
| console.json | Command help, prompts, errors, timing and output limits |
| consoleFS.json | Virtual filesystem, account IDs/descriptions, profile URLs, public API endpoints |
| discovery.json | Unlock IDs, navigation tiles, storage key, notifications |
| artGallery.json | Gallery copy and artwork entries |
| mangaTierlist.json, manhwaTierlist.json | Reading shelf copy, covers, half-star ratings |
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
./manga-tierlist
./manhwa-tierlist
```

`cat`, `open`, `nano`, `vim`, and `./` all execute files. `ls` accepts optional paths; `cd` supports absolute/relative paths, `..`, `.`, `~`, and no argument (root). Commands support quoted paths, up/down history, Tab completion, `pwd`, `help`, and `clear`. This is a virtual shell: input is never passed to eval, the OS, or a real shell.

Click a listed file to run its action or click a folder to enter it and see its contents. Both work automatically for new entries in `data/consoleFS.json`.

Discoveries add tiles to Home and the top-right menu with a short glitch. Executing a discovery never navigates. Unlocks are saved under the key configured in discovery.json, synchronized between tabs, and validated when loaded. Blocked storage falls back to in-memory state and reports that it cannot persist. Hidden routes show a discovery prompt until unlocked. This is a playful UI mechanic, not access control.

React components render account cards, links, directory listings, help and discovery notices; JSON is rendered as text, never injected as raw HTML. Terminal history is bounded and pending requests are canceled when their output unmounts.

## Account setup

Chess.com is connected directly to the public API using the username and endpoint in `data/consoleFS.json`. Executing `cat games_folder/chess_account` displays only Rapid and Blitz ratings plus the total games played across every chess mode returned by the API (wins, losses and draws included). Missing ratings display `Not played`. Chess.com may refresh its published data only once every 24 hours; these are the latest API values, not an instant match feed. The browser caches successful results for five minutes.

Riot displays only Solo/Duo rank, Flex rank and their combined current ranked game count (wins + losses from LEAGUE-V4). Its endpoint is intentionally empty until a separate secure Cloudflare Worker is configured. No preview ratings are presented as live data. **EUNE is a provisional default and must be checked.** Follow [the complete Riot activation guide](integrations/riot/README.md) to add a secret, deploy the Worker and connect its public URL. Never add a Riot key to frontend JSON or a Vite environment variable.

All account IDs/descriptions/endpoints remain in `data/consoleFS.json`; labels, provider settings, API paths, caching and notices are in `data/accountStats.json`. Steam remains an immediate profile link. Custom public HTTPS endpoints can return `{ "stats": [{ "label": "Rank", "value": "Gold" }] }` for non-Chess providers. HTTP errors, malformed responses, timeouts and cancellation are handled by the adapter.

## Images

**Nu trebuie să pregătești manual miniaturi, WebP-uri, `sources` sau `srcSet`.** Procesul obișnuit este:

| Colecție | Originalul se copiază în | Cardul se adaugă în lista `items` din |
| --- | --- | --- |
| Art Gallery | `public/artGallery/` | `data/artGallery.json` |
| Manga Tierlist | `public/tierlists/manga/` | `data/mangaTierlist.json` |
| Manhwa Tierlist | `public/tierlists/manhwa/` | `data/manhwaTierlist.json` |

1. Copiază originalul în folderul potrivit.
2. Adaugă un obiect cu ID unic, titlu, numele exact al fișierului, alt text și dimensiunile originale în pixeli. La tierlist adaugă și `rating` (de exemplu 0). `description` este opțională.
3. Din `tcnsite/`, rulează `npm run optimize:images`, apoi `npm test` și `npm run dev` pentru verificare locală. Oprește serverul cu Ctrl+C înainte de alte comenzi în aceeași fereastră.
4. Fă Commit + Push inclusiv pentru manifestul și variantele generate, apoi `npm run deploy` pentru publicare.

**O poză copiată în folder nu apare singură pe site: trebuie și obiectul din JSON.** În `image` scrii numele originalului (de exemplu `noua-serie.jpg`), nu calea din `public/optimized`. Nu edita manual `data/imageVariants.json` sau `public/optimized/`.

[Ghidul complet pentru imagini](IMAGES_GUIDE.md) conține exemple JSON pentru galerie și tierlisturi, cu pași pentru aflarea dimensiunilor în Windows, înlocuirea pozelor și depanare. Explică și fișierele generate automat. Cover-urile sunt încadrate din centru la afișare; nu trebuie tăiate manual la 7:10.

Galeria și tierlisturile se încarcă la accesare; imaginile folosesc dimensiuni rezervate, decodare asincronă și lazy loading. Originalele rămân sursa de adevăr și fallback-ul de afișare. Câmpurile manuale `sources`/`srcSet` sunt numai o opțiune avansată, nu o cerință pentru carduri noi.

The background is drawn with CSS gradients and a small inline SVG: slow orbital curves, sparse dots and ambient light. It requests no background photographs and runs no JavaScript animation loop. It inherits theme colors, fades to a solid matte on collection pages, pauses when the tab is hidden or a matte page is open, and becomes static with reduced-motion preferences. Mobile renders fewer animated layers. Edit geometry and speeds in `data/background.json`, and theme intensity in `data/themes.json`. Unused photograph backgrounds have been removed.

## Structure and accessibility

- `src/components/command`: pure filesystem/command engine, terminal UI, rich output
- `src/context`: shared discovery state
- `src/services`: public statistics API integration
- `src/components/collections`: reusable cards, images, ratings and description view
- `src/components/navigation`: shared navigation, return links and social links
- `src/components/layout`: panels and background layers

Native modal dialogs handle focus containment and Escape for menus/descriptions. The terminal is non-modal so visitors can see the discovery change on the website and interact with unlocked links. It focuses the input when opened and restores focus to its launcher when closed. Navigation uses real links, route changes focus main content, ratings have accessible text, and reduced-motion preferences disable decorative effects.

Amber, Midnight and Daylight palettes are preserved. CSS transitions smoothly update the procedural background color with the theme. No background image decoding is needed.

For complete editing and page creation instructions, see [PAGE_GUIDE.md](./PAGE_GUIDE.md).

## Performance and image generation

About, Projects, Hobbies and Contact are included in the initial bundle; collection and configurable extra pages load on demand. Terminal, discovery and project entrances use CSS transforms/opacity rather than a JavaScript layout engine. Theme switching retains CSS color transitions on key surfaces and headings, without animating every nested text span. Large panels and modal backdrops no longer repeatedly blur the animated background. Terminal output is memoized so typing does not rerender existing rich output.

`npm run build` (including `npm run deploy`) first runs `npm run optimize:images`. This generates responsive WebP files for collection images and `data/imageVariants.json`, preserving all originals, names, descriptions and crops. Cached content hashes skip unchanged work. Variants larger than the original are discarded; native-resolution originals remain candidates when conversion would be larger. Old generated variants are removed only inside `public/optimized`.

Configure collections, widths and quality in `data/imageOptimization.json`. Add new collection JSON files there when needed. After adding/changing images, run `npm run optimize:images` before local development or tests. Commit the generated manifest and `public/optimized` files with your source. Hand-authored image sources/srcSet still take priority. Lazy loading, explicit dimensions, centered cover cropping and image error fallbacks remain available.

Validation: production build, terminal/filesystem/storage/rating tests, responsive-image size/reference checks, and browser checks of discovery, navigation, dialogs, themes and mobile layouts. Bundle measurements compare production outputs, not development-mode timings; no fixed frame-rate guarantee is implied.

## Background selector and stable layout

The wallpaper button next to the theme button selects Orbital, Flow, or Still. Selection is stored locally using the key in `data/background.json`. Only the selected geometry is mounted: changing variants does not run multiple backgrounds. Still mounts no decorative SVG or animation. Both animated variants use CSS transforms, inherit theme colors and pause on matte pages/hidden tabs. Labels, descriptions and flow paths are in the same JSON.

Critical CSS in `index.html` reserves the vertical scrollbar before the external stylesheet or application loads. Keep it consistent with `src/index.css`: root `overflow-y: scroll`, `scrollbar-gutter: stable` and horizontal overflow clipping. Page minimum heights use `svh` to avoid mobile browser toolbar resizing. Route loading placeholders reserve the page height. Project cards no longer use approximate offscreen heights. Native dialogs lock root scrolling while retaining the reserved gutter.

## Theme defaults and navigation

Midnight Miel (`blue`) is the default for visitors without a valid saved preference; an existing saved theme is preserved. The initial palette is generated from `data/themes.json` in the Vite HTML transform, including a small bootstrap that applies saved colors before first paint. Do not duplicate palette values in CSS. Daylight uses a muted sage/gray palette instead of near-white surfaces. Background timings (22-second light drift, 48-second curve drift, 7-second point pulse) live in `data/background.json`.

The four main navigation pages (About, Projects, Hobbies and Contact) are included in the initial bundle to avoid separate code requests on the first visit. Their components are rendered only when opened. Collection pages, configurable extra pages and the not-found view remain lazy-loaded. Page entrance and theme animations remain enabled.

## Keyboard navigation

`a`: About, `p`: Projects, `h`: Hobbies, `c`: Contact. `Backspace` returns to the previous router history entry; if no previous entry exists, it returns to Home. It never deliberately navigates away from the portfolio. The five main pages are already in the initial bundle.

Bindings are configured in `data/shortcuts.json`. Shortcuts are ignored while typing in inputs/editable content, while the terminal or a dialog/popover is open, for held keys/IME composition, and with Ctrl/Alt/Meta/Shift. The existing terminal shortcut (`~`) remains available.
