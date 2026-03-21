
export function normalizeToArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

export function normalizeToSingle<T>(value: T | T[]): T {
  return Array.isArray(value) ? value[0] : value
}
