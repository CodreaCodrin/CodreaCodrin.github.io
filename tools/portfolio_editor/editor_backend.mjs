import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';

const definitions = [
  ['artGallery.json', 'gallery'],
  ['mangaTierlist.json', 'tierlist'],
  ['manhwaTierlist.json', 'tierlist'],
  ['movie_watchlist.json', 'watchlist'],
  ['series_watchlist.json', 'watchlist'],
];
const simpleFilename = name => typeof name === 'string' && !!name && name === path.basename(name) && !/[:\\/]/.test(name) && !['.', '..'].includes(name);
const inside = (base, target) => {
  const relative = path.relative(base, target);
  return relative !== '' && relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
};
const parse = data => JSON.parse(data.toString('utf8').replace(/^\uFEFF/, ''));
const read = async filename => parse(await fs.readFile(filename));
const revisionOf = contents => createHash('sha256').update(contents).digest('hex');
const streamingCatalog = project => read(path.join(project, 'data', 'streamingServices.json'));

async function collection(project, filename) {
  const definition = definitions.find(([key]) => key === filename);
  if (!definition) throw new Error('Colecție necunoscută.');
  const [, kind] = definition;
  const file = path.join(project, 'data', filename);
  const contents = await fs.readFile(file);
  const data = parse(contents);
  const publicRoot = await fs.realpath(path.join(project, 'public'));
  const directory = path.resolve(publicRoot, data.assetDirectory);
  if (!inside(publicRoot, directory)) throw new Error('Folderul imaginilor trebuie să fie în public/.');
  const realDirectory = await fs.realpath(directory);
  if (!inside(publicRoot, realDirectory)) throw new Error('Folderul imaginilor indică în afara public/.');
  return { file, contents, data, directory: realDirectory, kind };
}

async function snapshot(project, filename) {
  const { data, contents, kind } = await collection(project, filename);
  const routes = data.discoveryId ? (await read(path.join(project, 'data', 'discovery.json'))).items : await read(path.join(project, 'data', 'pages.json'));
  const route = routes.find(entry => data.discoveryId ? entry.id === data.discoveryId : entry.dataFile === filename);
  return { filename, kind, title: data.title, discoveryId: data.discoveryId, route: route?.path, aspect: data.coverAspectRatio,
    revision: revisionOf(contents), items: data.items };
}

function sharpFor(project) {
  return createRequire(path.join(project, 'package.json'))('sharp');
}

async function imageData(project, filename) {
  const buffer = await fs.readFile(filename);
  const input = sharpFor(project)(buffer, { limitInputPixels: 100_000_000 });
  const metadata = await input.metadata();
  const extension = { jpeg: 'jpg', png: 'png', webp: 'webp' }[metadata.format];
  if (!extension) throw new Error('Alege o imagine JPEG, PNG sau WebP.');
  return { input, buffer, extension, dimensions: metadata.autoOrient ?? metadata };
}

async function preview(project, request) {
  let imagePath = request.imagePath;
  if (!imagePath) {
    const { data, directory } = await collection(project, request.filename);
    const image = data.items.find(item => item.id === request.id)?.image;
    if (!image) return {};
    if (!simpleFilename(image)) throw new Error('Numele imaginii din colecție este invalid.');
    imagePath = await fs.realpath(path.join(directory, image));
    if (!inside(directory, imagePath)) throw new Error('Imaginea indică în afara colecției.');
  }
  const { input, dimensions } = await imageData(project, imagePath);
  const thumbnail = await input.rotate().resize({ width: 640, height: 850, fit: 'inside', withoutEnlargement: true }).png().toBuffer();
  return { image: thumbnail.toString('base64'), width: dimensions.width, height: dimensions.height };
}

function itemId(title, items) {
  const slug = title.normalize('NFKD').replace(/\p{Mark}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 72).replace(/_+$/, '') || 'entry';
  const base = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/.test(slug) ? `entry_${slug}` : slug;
  let id = base;
  for (let index = 2; items.some(item => item.id.toLowerCase() === id); index++) id = `${base}_${index}`;
  return id;
}

async function copyImage(directory, id, { buffer, extension }) {
  const stem = /^[a-z0-9][a-z0-9_-]{0,79}$/i.test(id) ? id.replaceAll('-', '_') : itemId(id, []);
  for (let index = 1; ; index++) {
    const name = `${stem}${index === 1 ? '' : '_' + index}.${extension}`;
    const file = path.join(directory, name);
    const handle = await fs.open(file, 'wx').catch(error => {
      if (error.code !== 'EEXIST') throw error;
    });
    if (!handle) continue;
    try {
      await handle.writeFile(buffer);
      await handle.close();
      return name;
    } catch (error) {
      await handle.close().catch(() => {});
      await fs.unlink(file).catch(() => {});
      throw error;
    }
  }
}

async function replaceFile(filename, contents) {
  const temporary = `${filename}.${randomUUID()}.tmp`;
  try {
    await fs.writeFile(temporary, contents, { flag: 'wx' });
    await fs.rename(temporary, filename);
  } finally {
    await fs.unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
}

function runNpm(project, script) {
  return new Promise((resolve, reject) => {
    const windows = process.platform === 'win32';
    const processName = windows ? process.env.ComSpec || 'cmd.exe' : 'npm';
    const args = windows ? ['/d', '/c', `npm.cmd run ${script}`] : ['run', script];
    const child = spawn(processName, args, { cwd: project, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let log = '';
    for (const stream of [child.stdout, child.stderr]) {
      stream.setEncoding('utf8');
      stream.on('data', chunk => { log = (log + chunk).slice(-9000); });
    }
    const command = `npm run ${script}`;
    child.once('error', error => reject(new Error(`${command}\n${error.message}`)));
    child.once('close', (code, signal) => {
      const output = `${command}\n${log.trim()}`.trimEnd();
      if (code === 0) resolve(output);
      else reject(new Error(`${output}\n${signal ? `Oprit: ${signal}` : `Cod de ieșire: ${code}`}`));
    });
  });
}

async function withProjectLock(project, operation) {
  const lockFile = path.join(project, 'data', '.portfolio_editor.local');
  const lock = await fs.open(lockFile, 'wx').catch(error => {
    if (error.code === 'EEXIST') throw new Error('O salvare sau publicare este deja în curs. Dacă editorul a fost oprit forțat, verifică fișierul data/.portfolio_editor.local.');
    throw error;
  });
  try {
    return await operation();
  } finally {
    await lock.close();
    await fs.unlink(lockFile);
  }
}

async function save(project, request) {
  const title = request.title?.trim();
  if (!title) throw new Error('Completează titlul.');
  const image = request.imagePath ? await imageData(project, request.imagePath) : null;
  return withProjectLock(project, async () => {
    const { file, contents, data, directory, kind } = await collection(project, request.filename);
    if (revisionOf(contents) !== request.revision) throw new Error('Colecția a fost modificată pe disc. Reîncarcă datele înainte de a salva din nou.');
    const index = data.items.findIndex(item => item.id === request.id);
    if (request.id && index < 0) throw new Error('Intrarea nu mai există. Reîncarcă datele.');
    if (index < 0 && !image) throw new Error('Alege o imagine pentru intrarea nouă.');
    const previous = index < 0 ? undefined : data.items[index];
    const item = { ...previous, id: previous?.id ?? itemId(title, data.items), title,
      alt: request.alt?.trim() || `${kind === 'gallery' ? 'Artwork' : 'Cover'}: ${title}` };
    if (kind === 'tierlist') {
      if (!Number.isFinite(request.rating) || request.rating < 0 || request.rating > 5) throw new Error('Ratingul trebuie să fie între 0 și 5.');
      item.rating = request.rating;
    }
    if (kind === 'watchlist') {
      const selected = Array.isArray(request.streamingServices) ? request.streamingServices : [];
      const known = (await streamingCatalog(project)).map(service => service.id).filter(id => selected.includes(id));
      if (known.length) item.streamingServices = known;
      else delete item.streamingServices;
      delete item.netflix;
    } else {
      const description = request.description?.trim();
      if (description) item.description = description;
      else delete item.description;
    }
    let addedImage;
    let updated;
    let committed = false;
    try {
      if (image) {
        addedImage = await copyImage(directory, item.id, image);
        item.image = addedImage;
        item.width = image.dimensions.width;
        item.height = image.dimensions.height;
        delete item.sources;
        delete item.srcSet;
        delete item.sample;
        delete item.posterSource;
      }
      if (index < 0) data.items.push(item);
      else data.items[index] = item;
      updated = Buffer.from(JSON.stringify(data, null, 2) + '\n');
      if (!(await fs.readFile(file)).equals(contents)) throw new Error('Colecția s-a modificat în timpul salvării. Reîncarcă datele.');
      await replaceFile(file, updated);
      committed = true;
      const log = await runNpm(project, 'optimize:images');
      return { id: item.id, log, collection: await snapshot(project, request.filename) };
    } catch (error) {
      if (committed) {
        if (!(await fs.readFile(file)).equals(updated)) throw new Error(`Colecția a fost modificată pe disc după salvare. ${error.message}`);
        await replaceFile(file, contents);
      }
      if (addedImage) await fs.unlink(path.join(directory, addedImage));
      if (committed) await runNpm(project, 'optimize:images').catch(() => {});
      throw error;
    }
  });
}

function deploy(project) {
  return withProjectLock(project, async () => {
    const optimized = await runNpm(project, 'optimize:images');
    try {
      const published = await runNpm(project, 'deploy');
      return { log: `${optimized}\n\n${published}` };
    } catch (error) {
      throw new Error(`${optimized}\n\n${error.message}`);
    }
  });
}

export async function run(request) {
  const project = path.resolve(request.project);
  const manifest = await read(path.join(project, 'package.json'));
  if (manifest.name !== 'tcnsite' || !manifest.scripts?.['optimize:images'] || !manifest.scripts?.dev) throw new Error('Alege folderul tcnsite din proiectul CodreaCodrin.github.io.');
  if (request.action === 'load') return {
    collections: await Promise.all(definitions.map(([file]) => snapshot(project, file))),
    streamingServices: await streamingCatalog(project),
  };
  if (request.action === 'preview') return preview(project, request);
  if (request.action === 'save') return save(project, request);
  if (request.action === 'deploy') {
    if (!manifest.scripts.deploy) throw new Error('Lipsește scriptul npm deploy din package.json.');
    return deploy(project);
  }
  throw new Error('Acțiune necunoscută.');
}

async function main(encoded) {
  try {
    const request = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
    process.stdout.write(JSON.stringify(await run(request)));
  } catch (error) {
    process.stdout.write(JSON.stringify({ error: error.message }));
  }
}
