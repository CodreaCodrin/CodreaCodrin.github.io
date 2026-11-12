const titles = new Intl.Collator('en', { sensitivity: 'base', numeric: true });

// Sort a copy so editing ratings never changes the source order or metadata.
export function sortByTitle<T extends { title: string }>(items: readonly T[]): T[] {
  return [...items].sort((first, second) => titles.compare(first.title, second.title));
}

export function sortByRating<T extends { title: string; rating?: number }>(items: readonly T[]): T[] {
  return [...items].sort((first, second) =>
    (second.rating ?? 0) - (first.rating ?? 0) || titles.compare(first.title, second.title));
}
