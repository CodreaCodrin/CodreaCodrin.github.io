import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = async file => JSON.parse((await fs.readFile(file, 'utf8')).replace(/^\uFEFF/, ''));
const config = await read(path.join(root, 'data/imageOptimization.json'));
const manifestPath = path.join(root, 'data/imageVariants.json');
const previous = await read(manifestPath).catch(() => ({}));
const manifest = {};
let originalBytes = 0, optimizedBytes = 0, processed = 0;
for (const collection of config.collections) {
  const data = await read(path.join(root, 'data', collection));
  for (const item of data.items) {
    if (!item.image) continue;
    const key = `${data.assetDirectory}/${item.image}`;
    const input = path.resolve(root, 'public', key);
    if (!input.startsWith(path.resolve(root, 'public') + path.sep)) throw new Error('Image must stay inside public');
    const buffer = await fs.readFile(input);
    originalBytes += buffer.length;
    const signature = createHash('sha256').update(buffer).update(JSON.stringify(config)).update('v2').digest('hex').slice(0, 16);
    if (previous[key]?.signature === signature && (await Promise.all(previous[key].variants.map(v => fs.access(path.join(root, 'public', v.path)).then(() => true, () => false)))).every(Boolean)) {
      manifest[key] = previous[key];
    } else {
      const meta = await sharp(buffer).rotate().metadata();
      const width = meta.autoOrient?.width ?? meta.width;
      const sizes = [...new Set(config.widths.map(size => Math.min(size, width)))];
      const variants = [];
      for (const size of sizes) {
        const filename = `${config.outputDirectory}/${path.basename(collection, '.json')}/${item.id}-${signature}-${size}.webp`;
        const output = path.resolve(root, 'public', filename);
        if (!output.startsWith(path.resolve(root, 'public', config.outputDirectory) + path.sep)) throw new Error('Invalid output path');
        await fs.mkdir(path.dirname(output), { recursive: true });
        const encoded = await sharp(buffer).rotate().resize({ width: size, withoutEnlargement: true }).webp({ quality: config.quality }).toBuffer();
        if (encoded.length < buffer.length) {
          await fs.writeFile(output, encoded);
          variants.push({ path: filename, width: size });
        }
      }
      // Keep the native-resolution original whenever conversion is not smaller.
      if (!variants.some(variant => variant.width === width)) variants.push({ path: key, width });
      manifest[key] = { signature, variants };
      processed++;
    }
    const largest = manifest[key].variants.at(-1);
    optimizedBytes += (await fs.stat(path.join(root, 'public', largest.path))).size;
  }
}
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
// Remove obsolete generated variants only; originals and other public assets are untouched.
const generatedRoot = path.resolve(root, 'public', config.outputDirectory);
if (!generatedRoot.startsWith(path.resolve(root, 'public') + path.sep)) throw new Error('Generated directory must stay inside public');
const active = new Set(Object.values(manifest).flatMap(entry => entry.variants.map(variant => path.resolve(root, 'public', variant.path))));
async function prune(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true }).catch(() => [])) {
    const target = path.resolve(directory, entry.name);
    if (!target.startsWith(generatedRoot + path.sep)) throw new Error('Invalid cleanup target');
    if (entry.isDirectory()) await prune(target);
    else if (entry.isFile() && entry.name.endsWith('.webp') && !active.has(target)) await fs.unlink(target);
  }
}
await prune(generatedRoot);
console.log(`Images: ${processed} regenerated; originals ${(originalBytes/1e6).toFixed(2)} MB → largest selected variants ${(optimizedBytes/1e6).toFixed(2)} MB.`);
