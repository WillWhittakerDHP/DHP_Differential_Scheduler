/**
 * Pick a random item from a list (or return null if empty).
 *
 * LEARNING: Keep randomness in a pure helper so composables stay small.
 */
export function pickRandomItem<CollectionItem>(items: readonly CollectionItem[]): CollectionItem | null {
  if (items.length === 0) return null
  const randomIndex = Math.floor(Math.random() * items.length)
  return items[randomIndex] ?? null
}


