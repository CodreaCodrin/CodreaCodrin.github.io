# Cum adaugi sau modifici o poză

**Tu adaugi doar poza originală și o intrare în JSON. Nu trebuie să creezi manual WebP-uri, miniaturi sau `srcSet`.** Optimizarea generează automat variantele potrivite. Originalele nu sunt modificate.

Toate căile de mai jos sunt relative la `tcnsite/`.

## 1. Alege colecția

| Unde apare poza | Unde copiezi originalul | JSON-ul pe care îl editezi |
| --- | --- | --- |
| Art Gallery | `public/artGallery/` | `data/artGallery.json` |
| Manga Tierlist | `public/tierlists/manga/` | `data/mangaTierlist.json` |
| Manhwa Tierlist | `public/tierlists/manhwa/` | `data/manhwaTierlist.json` |
| Movie Watchlist | `public/watchlists/movies/` | `data/movie_watchlist.json` |
| Series Watchlist | `public/watchlists/series/` | `data/series_watchlist.json` |

**Simpla copiere a pozei în folder nu creează un card.** Cardurile sunt definite în lista `items` din JSON.

Pentru operațiile obișnuite nu modifici componente React, `pages.json`, `assetDirectory` sau setările optimizării.

## 2. Copiază originalul

Folosește o imagine JPEG (`.jpg`/`.jpeg`), PNG (`.png`) sau WebP (`.webp`). Copiaz-o în folderul din tabel. Nu o pune în `dist/`, `src/` sau `public/optimized/`.

Recomandare pentru fișiere noi: nume simple, precum `munte-la-apus.jpg` sau `noua-serie.jpg`. Spațiile din numele originale sunt acceptate, dar numele simple sunt mai ușor de verificat. Nu schimba doar extensia unui fișier ca să-l „convertești”.

În Windows, activează **View > Show > File name extensions** în Explorer. Verifică numele complet, inclusiv extensia: `Poza.JPG` și `poza.jpg` sunt nume diferite pe GitHub Pages.

## 3. Adaugă obiectul în `items`

Deschide JSON-ul colecției și adaugă un obiect la sfârșitul listei `items`. Pune o virgulă după obiectul anterior, între cele două obiecte. Nu pune virgulă după ultimul obiect. Nu înlocui întregul fișier sau lista existentă cu exemplul.

### Exemplu pentru Art Gallery

Presupunem că ai copiat `munte-la-apus.jpg` în `public/artGallery/`, iar dimensiunile originale sunt 1200 × 800 px:

```json
{
  "id": "munte-la-apus",
  "title": "Munte la apus",
  "image": "munte-la-apus.jpg",
  "alt": "Creasta muntelui luminată de soarele de seară",
  "width": 1200,
  "height": 800,
  "description": "O fotografie făcută într-o drumeție."
}
```

### Exemplu pentru tierlist

Presupunem că ai copiat `noua-serie.jpg` în `public/tierlists/manhwa/`, iar dimensiunile originale sunt 900 × 1280 px:

```json
{
  "id": "noua-serie",
  "title": "Noua serie",
  "image": "noua-serie.jpg",
  "alt": "Coperta pentru Noua serie",
  "width": 900,
  "height": 1280,
  "rating": 0,
  "description": "Părerea mea despre această serie."
}
```

Înlocuiește valorile din exemple cu ale pozei tale.

| Câmp | Ce completezi |
| --- | --- |
| `id` | Identificator unic în colecție, de preferat litere mici și cratime. Nu copia ID-ul altui card. |
| `title` | Titlul afișat pe card. |
| `image` | Numele originalului, exact, cu extensie. Pentru folderele actuale nu adaugi `public/`, `artGallery/`, `tierlists/manga/` sau `tierlists/manhwa/` în acest câmp. |
| `alt` | Descriere scurtă a imaginii pentru accesibilitate. |
| `width`, `height` | Dimensiunile originale în pixeli, ca numere fără ghilimele. Nu dimensiunea cardului și nu dimensiunile WebP-urilor generate. |
| `description` | Opțional. Dacă există text, cardul poate fi apăsat pentru descriere. Dacă nu dorești asta, șterge câmpul. |
| `rating` | Numai pentru tierlist: număr între 0 și 5. Poți începe cu 0 și modifica ulterior. Stelele sunt afișate rotunjit la jumătăți. |

Pentru o imagine reală, nu adăuga `sample: true`. Nu copia câmpurile avansate `sources` sau `srcSet` dintr-un card vechi: ele pot trimite browserul la alte imagini și pot suprascrie alegerea automată.

### Cum afli dimensiunile originale

În Explorer: clic dreapta pe original > **Properties > Details > Image**, apoi citește Width și Height.

Alternativ, după instalarea dependențelor, rulează din `tcnsite/` comanda de mai jos și înlocuiește calea cu a originalului tău. Ea citește și orientarea EXIF a fotografiei:

```powershell
node --input-type=module -e "import sharp from 'sharp'; const m = await sharp('public/artGallery/munte-la-apus.jpg').metadata(); console.log(m.autoOrient ?? { width: m.width, height: m.height });"
```

## 4. Generează variantele și verifică local

Deschide PowerShell și intră în folderul aplicației:

```powershell
Set-Location 'C:\Alpine Studio\Projects\PersonalSite\CodreaCodrin.github.io\tcnsite'
```

La prima configurare, dacă lipsește `node_modules` sau s-au schimbat dependențele, rulează `npm ci`. Nu este necesar pentru fiecare poză nouă.

După ce ai salvat originalul și JSON-ul:

```powershell
npm run optimize:images
npm test
npm run dev
```

**Ordinea contează:** rulează optimizarea înainte de teste. Testele verifică și dacă imaginea nouă are o intrare în manifestul generat. `npm run dev` nu generează singur variantele.

Deschide adresa Local afișată de Vite. În terminalul site-ului execută:

- Pentru galerie: `cat art_gallery`, apoi apasă butonul Art Gallery de pe Home sau din meniu.
- Pentru Manga Tierlist, rulează `cat tierlists/manga_tierlist`, apoi apasă butonul Manga Tierlist.
- Pentru Manhwa Tierlist, rulează `cat tierlists/manhwa_tierlist`, apoi apasă butonul Manhwa Tierlist.
- Pentru watchlist-uri, deschide `future_plans/movies` în terminal. Cardurile sunt ordonate după titlu. Folosește `_` în ID-uri și în numele posterelor, de exemplu `alien_worlds.webp`. Poți adăuga `"streamingServices": ["netflix", "disney_plus"]` pentru etichetele serviciilor și `posterSource` pentru sursa imaginii.

Poți și să rulezi `ls -a tierlists` și să apeși numele fișierului ascuns din listă. După deblocare, terminalul afișează un link direct către pagină. Deblocarea este păstrată în browser pentru adresa respectivă.

Verifică titlul, imaginea, crop-ul și descrierea. Tierlistul se sortează după notă descrescător, apoi alfabetic la egalitate: un card nou cu nota 0 poate apărea jos, nu lângă primul card. Galeria actuală păstrează ordinea din `items`.

Oprește serverul cu **Ctrl+C** când ai terminat. Dacă schimbi din nou pozele/JSON-ul cu serverul pornit, rulează `npm run optimize:images` într-un al doilea terminal din `tcnsite/`, apoi reîncarcă pagina.

## 5. Salvează și publică

După optimizare și teste, verifică în GitHub Desktop și fă **Commit + Push** pentru:

- originalul nou sau modificat;
- JSON-ul colecției;
- `data/imageVariants.json`;
- fișierele generate/adăugate/șterse din `public/optimized/`.

Apoi, din `tcnsite/`, rulează:

```powershell
npm run deploy
```

Deploy-ul rulează automat build-ul, iar build-ul rulează automat optimizarea. Nu trebuie să creezi manual variante înainte de deploy; comanda separată este utilă pentru verificarea locală și necesară înaintea testelor după adăugarea unei imagini.

Actualizarea site-ului public și salvarea sursei sunt operații diferite: **Commit + Push** salvează proiectul, iar **`npm run deploy`** publică site-ul. După publicare, verifică rezultatul pe GitHub Pages și folosește Ctrl+F5 dacă vezi încă versiunea veche.

## Ce se generează automat și ce nu editezi

| Fișier/folder | Rol | Îl editezi manual? |
| --- | --- | --- |
| Originalele din folderele colecțiilor | Sursa imaginilor și fallback pentru afișare | Da, aici adaugi/înlocuiești pozele. |
| `data/artGallery.json`, `data/mangaTierlist.json`, `data/manhwaTierlist.json` | Carduri, titluri, descrieri și note | Da. |
| `public/optimized/` | Variante responsive, cu ID/hash/dimensiune în nume | Nu. Scriptul le generează și curăță variantele vechi. |
| `data/imageVariants.json` | Legătura dintre fiecare original și variantele sale | Nu. Se regenerează automat. |
| `data/imageOptimization.json` | Colecțiile cu rute dedicate, dimensiunile și calitatea | Când schimbi setările de optimizare. |
| `dist/` | Rezultatul build-ului pentru publicare | Nu. Nu adăuga poze aici. |

Scriptul poate crea variante la 320, 640, 960 și 1440 px lățime, fără să mărească imaginile mici. Păstrează o variantă WebP numai dacă ocupă mai puțin decât originalul. Unele poze pot rămâne servite din original; nu este o eroare. La următoarea rulare, imaginile neschimbate sunt reutilizate.

Browserul alege varianta potrivită și încarcă imaginile de mai jos doar când se apropie de zona vizibilă. Pentru tierlist, încadrarea 7:10 și crop-ul din centru sunt făcute la afișare. **Nu trebuie să tai manual toate cover-urile la aceeași dimensiune.** Galeria folosește proporțiile fiecărei imagini. Optimizarea nu rescrie originalele.

## Înlocuire, redenumire și ștergere

- **Înlocuiești poza:** suprascrie originalul, actualizează `width`/`height` dacă s-au schimbat, apoi rulează optimizarea. Hash-ul nou schimbă URL-urile variantelor generate, ca browserul să nu le confunde cu cele vechi.
- **Redenumești originalul:** redenumește fișierul și actualizează `image` în JSON, apoi rulează optimizarea.
- **Modifici doar titlul, descrierea sau nota:** editează câmpul în JSON; nu este necesară regenerarea pozelor. Publică din nou pentru site-ul live.
- **Ștergi un card:** elimină obiectul din `items`. Poți șterge originalul dacă nu este folosit în altă parte. Rulează optimizarea: scriptul curăță variantele generate care nu mai sunt referite, dar nu șterge originalele în locul tău.
- **Adaugi altă colecție:** urmează `PAGE_GUIDE.md`. Optimizarea include automat colecțiile înregistrate în `data/pages.json`.

## Dacă poza nu apare sau apare cea veche

1. Există un obiect nou în `items`? Folderul nu este scanat automat pentru carduri.
2. `image` corespunde exact fișierului, inclusiv majuscule și extensie? Nu ai scris din greșeală `.jpg.jpg`?
3. Originalul este în folderul colecției, fără `public/` în valoarea câmpului `image`?
4. JSON-ul este valid, cu ID unic, virgulă între obiecte și `width`/`height` pozitive?
5. Ai rulat `npm run optimize:images` după modificare? Dacă scriptul spune `ENOENT`, verifică numele și calea fișierului raportat.
6. Ai copiat `sources` sau `srcSet` de la alt card? Elimină-le pentru a folosi variantele automate.
7. Ai căutat cardul și mai jos în tierlist, unde îl plasează nota și sortarea?
8. Verifici site-ul local sau cel public? Pentru cel public trebuie `npm run deploy`; simplul Push nu publică modificarea.
9. După publicare, încearcă Ctrl+F5. Nu șterge progresul descoperirilor doar pentru a reîncărca o imagine.
