import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../data/imageVariants.json', import.meta.url)));
test('responsive images exist and never replace an original with a larger download', () => {
  for (const [original, entry] of Object.entries(manifest)) {
    const size = statSync(new URL('../public/' + original, import.meta.url)).size;
    assert.ok(entry.variants.length);
    let width = 0;
    for (const variant of entry.variants) {
      assert.ok(variant.width > width);
      assert.ok(statSync(new URL('../public/' + variant.path, import.meta.url)).size <= size);
      width = variant.width;
    }
  }
});

test('every collection image has responsive variants without changing original filenames', () => {
  for (const name of ['artGallery', 'manhwaTierlist']) {
    const collection = JSON.parse(readFileSync(new URL('../data/' + name + '.json', import.meta.url)));
    for (const item of collection.items) {
      if (item.image) assert.ok(manifest[`${collection.assetDirectory}/${item.image}`]);
    }
  }
});
