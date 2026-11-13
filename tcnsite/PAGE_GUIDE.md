# Portfolio editing and page creation guide

All paths below are relative to `tcnsite/`. Run commands from that directory. Production is a static Vite build hosted on GitHub Pages; there is no production Node server.

## 1. Quick reference

| What to change | File |
| --- | --- |
| Home greeting, biography, links, existing page text, accessibility labels | `data/site.json` |
| Project cards | `data/projects.json` |
| Technology badge colors | `data/tagColors.json` |
| New pages using existing layouts | `data/pages.json` plus a page JSON file |
| Secret navigation tiles and discovery messages | `data/discovery.json` |
| Terminal files, folders, accounts and unlock actions | `data/consoleFS.json` |
| Terminal messages, hint, command guide and timing | `data/console.json` |
| Artwork entries | `data/artGallery.json` |
| Manhwa and manga entries and ratings | `data/manhwaTierlist.json` |
| Shared collection labels and responsive image sizes | `data/collections.json` |
| Theme colors and procedural background intensity | `data/themes.json` |
| Background geometry and animation speeds | `data/background.json` |
| Shared layout, home tiles and theme transitions | `src/index.css` |
| Terminal layout and suggestion arrow | `src/components/command/Terminal.css` |
| Collection layout | `src/components/collections/CollectionView.css` |

Use valid JSON: double quotes, no comments, and no trailing commas. Paths and filenames are case-sensitive on GitHub Pages, even if Windows accepts different casing. Keep visible text in JSON; JSX should describe layout and behavior.

## 2. Edit current pages

Home reads `site.home.greetings` and `site.home.intro`. Intro entries with a `path` render as links; entries containing only `text` render as normal text. Preserve spaces at the beginning/end of fragments so words do not run together.

About reads `site.about.title` and `site.about.paragraphs`. Each string is a separate paragraph. Hobbies reads `site.hobbies.sections`: each entry has `icon`, `title`, and `content`. Supported hobby icons are `Dumbbell`, `Crown`, and `Gamepad2`; adding an entirely new icon requires updating the icon map in `src/pages/Hobbies/Hobbies.tsx`.

Contact and Home share `site.socialLinks`. Supported icons are `Github`, `Linkedin`, and `Mail`; update `SocialLinks.tsx` to support other icons. An email URL uses `mailto:address@example.com`.

Projects are objects with `projectName`, `description`, `tags`, `githubLink`, and `demoLink`. Leave a link empty to omit that action. The order in the array is the display order. Tag names match keys in `tagColors.json`.

Existing bespoke pages are registered in `src/App.tsx`. The JSON registry described next is for additional pages; do not register an existing path twice.

## 3. Add a standard text page using JSON

Create `data/readingNotes.json`:

```json
{
  "title": "Reading notes",
  "paragraphs": [
    "The first paragraph of my page.",
    "Another paragraph, displayed below a divider."
  ]
}
```

Add this entry to the array in `data/pages.json` (initially an empty array):

```json
[
  {
    "path": "/reading-notes",
    "type": "content",
    "dataFile": "readingNotes.json",
    "matte": false
  }
]
```

The registry creates the route automatically. `dataFile` is relative to `data/`, uses forward slashes, and must refer to a JSON file committed with the project. Nested paths such as `pages/readingNotes.json` are supported. Restart the dev server if a newly created file is not picked up immediately.

To show the page immediately, append a navigation entry to `data/site.json` under `navigation`:

```json
{ "title": "Rn", "text": "reading notes", "path": "/reading-notes", "home": true }
```

`title` is the large tile abbreviation; `text` is the small label. `home: true` shows the tile on Home. Every entry appears in the menu. Array order controls tile order. Home uses an expanding grid; no extra CSS or fixed height is needed when more entries are added.

Visit `http://localhost:5173/#/reading-notes`. On GitHub Pages the URL is `https://CodreaCodrin.github.io/#/reading-notes`. Keep the hash: the host cannot rewrite arbitrary paths to the app.

## 4. Make that page a terminal discovery

For a secret page, omit its public `site.navigation` entry. Instead append to `data/discovery.json` under `items`:

```json
{ "id": "reading-notes", "title": "Rn", "text": "Reading notes", "path": "/reading-notes" }
```

Add `"discoveryId": "reading-notes"` to its `pages.json` entry. This guards direct links until the page is discovered.

Append a file to the desired directory's `children` in `data/consoleFS.json`:

```json
{
  "type": "file",
  "name": "reading_notes",
  "action": "unlock",
  "discoveryId": "reading-notes"
}
```

The `id` in discovery.json, the registry's `discoveryId`, and the terminal file's `discoveryId` must match exactly. The file's `name` is what visitors type; it need not equal the URL or the ID.

Run `cat reading_notes`, `open reading_notes`, or `./reading_notes` in the directory containing the file. It triggers the glitch, adds a Home tile and menu entry, and saves the discovery. It deliberately stays on the current page. Clicking the new tile opens the page.

The Home panel grows vertically and additional tiles wrap into new rows. The menu scrolls when necessary. On small screens, tiles fit into fewer columns. No hardcoded button count is used.

Discoveries are saved under `discovery.storageKey` in localStorage. Keep stable IDs when changing titles. To test a first visit, remove only that key using browser DevTools > Application > Local Storage, or use a private window. Different ports and hostnames have separate storage. Changing the storage key resets discoveries for all visitors; do that only intentionally.

This is an exploration mechanic, not security: static site data is publicly downloadable.

## 5. Add another gallery or tierlist using JSON

Create a new data file, for example `data/photography.json`:

```json
{
  "discoveryId": "photography",
  "eyebrow": "THROUGH THE LENS",
  "title": "Photography",
  "description": "Moments I wanted to keep.",
  "assetDirectory": "photography",
  "emptyMessage": "The first photographs are coming soon.",
  "sampleNotice": "Preview photographs",
  "items": [
    {
      "id": "mountain-light",
      "title": "Mountain light",
      "image": "mountain-light.jpg",
      "alt": "Evening sunlight on a mountain ridge",
      "width": 1200,
      "height": 800,
      "description": "The story behind this photograph."
    }
  ]
}
```

Put the image in `public/photography/mountain-light.jpg`. Add a registry entry:

```json
{
  "path": "/photography",
  "type": "gallery",
  "dataFile": "photography.json",
  "matte": true,
  "discoveryId": "photography"
}
```

Add matching discovery and filesystem entries as in section 4. `matte: true` fades the procedural background out and uses the theme's solid color. `matte: false` retains it. Without an explicit value, discovery routes use matte backgrounds.

For a public collection, use `"discoveryId": ""` in its data, omit the registry's discoveryId, and add a regular site navigation entry. For a secret collection, keep the same discoveryId in all four places: collection data, registry, discovery item, terminal file.

Use `type: "tierlist"` to place titles above images and ratings below. Add `rating` to each item: 0 through 5 in increments of 0.5. `type: "gallery"` places titles below images. An omitted/empty description makes a card non-interactive; a supplied description opens a modal. Use unique item IDs. Set `items: []` for an intentional empty state.

To edit the original Art Gallery or Manhwa & Manga Tierlist, change their existing JSON files directly. Their routes are already registered; do not duplicate them in pages.json.

## 6. Images and performance

The initial sample cards have empty image filenames and `sample: true`. Replace filenames and text, then remove `sample` or set it to false. Delete unused sample entries. Alternative text should describe the real image. Width and height must match its aspect ratio to reserve the right amount of space.

Images are never embedded in JSON. Gallery filenames are relative to `assetDirectory`, which is relative to `public/`. Do not put `public/` at the front of an image path. New/modified images must be rebuilt and deployed with the site.

Optional responsive versions:

```json
{
  "id": "mountain-light",
  "title": "Mountain light",
  "image": "mountain-1200.jpg",
  "alt": "Evening sunlight on a mountain ridge",
  "width": 1200,
  "height": 800,
  "srcSet": "mountain-600.jpg 600w, mountain-1200.jpg 1200w",
  "sources": [
    { "type": "image/avif", "srcSet": "mountain-600.avif 600w, mountain-1200.avif 1200w" },
    { "type": "image/webp", "srcSet": "mountain-600.webp 600w, mountain-1200.webp 1200w" }
  ]
}
```

Create those files before referencing them. All versions should have the same crop/aspect ratio. Browsers select a format and resolution using `picture`, `srcSet`, and the `collections.imageSizes` setting. Below-the-fold images use native lazy loading; the first image loads eagerly. Decoding is asynchronous, dimensions reserve space, and failed images show a fallback. No runtime image transformation service is needed.

### Theme backgrounds

Backgrounds are generated entirely in code; no photograph is loaded. `src/components/layout/Background.tsx` renders the inline SVG and CSS layers; `Background.css` controls their appearance.

Edit `data/background.json` to change the SVG viewBox, ellipse centers/radii/rotation/opacity, decorative points, and `motion.fieldSeconds` / `motion.orbitSeconds`. Larger durations mean slower motion. Keep counts small for mobile performance.

Each theme in `data/themes.json` inherits its primary color and defines `--background-glow-opacity`, `--background-line-opacity`, and `--background-dot-opacity` (values from 0 to 1). Reduce these values for a quieter background. The obsolete background JPEGs have been removed.

Matte pages fade all decorative layers out, leaving the theme's solid base. Animation pauses on matte pages and hidden tabs; reduced-motion preferences disable it completely. Phones omit the secondary glow and point pulsing. No canvas, WebGL, pointer tracking or animation package is needed.

## 7. Terminal customization

The backquote/tilde key opens and closes the terminal (`~`, or the physical Backquote key on common keyboards). Escape closes it. Repeated keydown, IME composition, Ctrl/Alt/Meta combinations, other editable fields and open modal dialogs are ignored. Inside the terminal, that shortcut toggles the terminal rather than inserting a literal tilde. The pointer button works on phones.

The terminal hint is a thought bubble with an opaque neutral background, a faint border, small muted text, and two small circles leading toward the launcher. It appears until the terminal is first opened during the current app session. Its visible copy is `console.suggestion`; `console.shortcutHint` is the launcher tooltip. Its appearance is in Terminal.css. Reopening after a full refresh shows the hint again; the hint does not reset saved discoveries.

Directory shape:

```json
{
  "type": "directory",
  "name": "my_folder",
  "children": [
    { "type": "file", "name": "my_page", "action": "unlock", "discoveryId": "my-page" }
  ]
}
```

Add directory objects inside other directories' children to nest them. Use unique sibling names and avoid slashes in names. The virtual shell supports ls, cd, pwd, help, clear, cat, open, nano, vim and ./, including relative/absolute paths and parent traversal. No real OS commands execute.

Account files use `action: "account"` for delayed statistics or `action: "profile"` for an immediate description/link. Edit IDs, descriptions and URLs in `data/consoleFS.json`. Chess.com uses its public player-stats endpoint directly, with an encoded `{accountId}`. For Riot, follow [the secure Worker setup guide](integrations/riot/README.md); the frontend never receives the API key. Set the public Worker URL as the Riot endpoint once deployed. Labels, API routes, allowed origins, queue names and cache settings live in `data/accountStats.json`. Custom non-Chess endpoints return `{ "stats": [{ "label": "Rank", "value": "Gold" }] }` over HTTPS with browser CORS access. A missing endpoint shows a configuration notice, not fake statistics. Redeploy the Worker as well as the site if its shared JSON configuration changes.

Adding a new command or executable action requires TypeScript changes to the pure engine and/or output renderer under `src/components/command/`, plus its help copy in console.json. Adding ordinary folders, account files or discovery files needs JSON only.

## 8. Add a page with a completely custom layout

JSON page types cover paragraphs, galleries and tierlists. For a new interaction/layout, create a component under `src/pages/YourPage/`, put its text/items in `data/yourPage.json`, import the JSON, and reuse PageWrapper or ReturnHome. Reuse CollectionView, OptimizedImage, StarRating, Modal and SocialLinks where useful.

Import the component in App.tsx and create a route following the existing aboutRoute pattern:

```tsx
const customRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/custom-page',
  component: CustomPage,
});
```

Add customRoute to rootRoute.addChildren. Add regular navigation or discovery/filesystem entries as above. A custom secret component must check useDiscovery().unlocked before rendering its private-looking UI, following ConfiguredPage's guard. Never register the same custom route in pages.json too. For a custom matte page, update the matte selection in RootComponent or use a discovery route (which defaults to matte).

## 9. Rename, remove and reorder pages

- Change visible labels without changing stable IDs or paths when possible.
- Reorder site.navigation or discovery.items to reorder the corresponding tiles.
- To rename a route, update registry/App registration, navigation/discovery paths, and any intro links referring to it.
- To remove a secret page, remove its registry/App route, discovery item and console file. Remove unused data/assets after checking references. Unknown saved discovery IDs are filtered on load.
- Do not rename the localStorage key casually; that starts fresh discovery progress.
- Browser Back/Forward uses hash history. Use router Link or useNavigate for internal navigation.

## 10. Verify and deploy

```sh
npm run dev
npm test
npm run build
npm run preview
```

Use the Local URL printed by each command. Test direct links and refresh, Home and menu links, new discoveries and repeat execution, keyboard operation, card descriptions, no-description cards, and a narrow phone viewport. Confirm that long tile labels wrap and the panel grows with additional rows. Test a private window to see the locked state.

The tests check command/path behavior, storage failure handling and JSON references. The build checks TypeScript and produces static files in dist. Neither command publishes the site.

When ready to publish, `npm run deploy` runs the existing gh-pages workflow. GitHub Pages should serve its configured deployment branch. Commit source/data/images separately through your normal Git workflow. A running dev server is not the deployed site; JSON updates appear on GitHub Pages only after rebuilding and deploying.

If a page fails: confirm exact filenames/case, valid JSON, unique route paths, matching discovery IDs, existing image variants, and the URL hash. Check browser console/network errors. A blank or stale view after editing may need a full reload or dev-server restart. Preserve discovery storage while reloading. Private browser sessions or different origins intentionally have separate discovery progress.

## Reading shelf ordering and cover crops

`manhwaTierlist.json` uses `"sort": "rating"`: highest rating first, then alphabetical title for equal ratings. Editing ratings automatically changes the displayed order after reload/rebuild. Use `"sort": "title"` for alphabetical order alone, or remove sort to preserve array order. Other collections can use the same settings.

`"coverAspectRatio": { "width": 7, "height": 10 }` gives every cover the proportions of Houseki no Kuni (840 x 1200). The browser scales each image to fill that frame, then crops excess from the center with object-fit: cover. This automatically zooms/crops unusually wide or tall images without stretching them or editing originals. Keep original width/height metadata in each item. Remove coverAspectRatio to use each original aspect ratio, as the art gallery does.

The Home discovery hint is only shown while at least one configured discovery is still locked. The hidden coffin file uses the generic message action; its response is stored in consoleFS.json.

Terminal Tab always attempts completion and keeps input focus even if there is no match. Shift+Tab still moves focus for keyboard navigation. Hidden entries become completion candidates only after an `ls -a` listing actually reveals them; knowledge is tracked by absolute path for the current app session, survives clear/closing the terminal, and resets on a full page reload.

## Automatic image optimization

Add images and JSON entries as usual. Run `npm run optimize:images` before development/tests; production builds and deploys run it automatically. Settings live in `data/imageOptimization.json`. Do not edit `data/imageVariants.json` or files under `public/optimized` by hand. Include them in Git commits; originals remain the source of truth. Cached variants regenerate only when the source/settings change. This does not change cover cropping, titles, ratings or sorting.

## Background selector and stable layout

The wallpaper button next to the theme button selects Orbital, Flow, or Still. Selection is stored locally using the key in `data/background.json`. Only the selected geometry is mounted: changing variants does not run multiple backgrounds. Still mounts no decorative SVG or animation. Both animated variants use CSS transforms, inherit theme colors and pause on matte pages/hidden tabs. Labels, descriptions and flow paths are in the same JSON.

Critical CSS in `index.html` reserves the vertical scrollbar before the external stylesheet or application loads. Keep it consistent with `src/index.css`: root `overflow-y: scroll`, `scrollbar-gutter: stable` and horizontal overflow clipping. Page minimum heights use `svh` to avoid mobile browser toolbar resizing. Route loading placeholders reserve the page height. Project cards no longer use approximate offscreen heights. Native dialogs lock root scrolling while retaining the reserved gutter.

## Keyboard navigation

`a`: About, `p`: Projects, `h`: Hobbies, `c`: Contact. `Backspace` returns to the previous router history entry; if no previous entry exists, it returns to Home. It never deliberately navigates away from the portfolio. The five main pages are already in the initial bundle.

Bindings are configured in `data/shortcuts.json`. Shortcuts are ignored while typing in inputs/editable content, while the terminal or a dialog/popover is open, for held keys/IME composition, and with Ctrl/Alt/Meta/Shift. The existing terminal shortcut (`~`) remains available.

## Unadvertised terminal aliases

`data/consoleAliases.json` defines compatibility aliases independently of the public help list. `l`, `ll`, `la`, `lla`, `dir` and `vdir` reuse `ls`; `la`/`lla` include hidden entries. `ls -all`, `--all`, `-A`, `--almost-all`, `-la`, `-al` and `-lah` reveal the same hidden files as `ls -a`. Formatting flags (`-l`, `-h`, `-F`, `-1`, and color flags) retain the existing compact listing; no detailed or recursive listing is implemented. `--` ends option parsing.

`less`, `more`, `bat`, `vi`, `view`, `nvim`, `emacs` and `xdg-open` reuse file execution, without actual editors or paging. `chdir`, `..` and `...` reuse directory navigation. `cls`/`reset` clear the output, and `?` shows the existing help. Aliases participate in completion; hidden files still require discovery first. None of these aliases are added to `console.commands` or help.
