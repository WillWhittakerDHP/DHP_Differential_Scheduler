/**
 * Pick a random item from a list (or return null if empty).
 *
 */
export function pickRandomItem<CollectionItem>(items: readonly CollectionItem[]): CollectionItem | null {
  if (items.length === 0) return null
  const randomIndex = Math.floor(Math.random() * items.length)
  return items[randomIndex] ?? null
}
