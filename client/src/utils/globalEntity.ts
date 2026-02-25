import type { GlobalEntityId } from '@shared/types/primitiveBrands'

export function toGlobalEntityId(value: string): GlobalEntityId {
  return value as GlobalEntityId
}

export function toGlobalEntityIdOrNull(
  value: string | null | undefined
): GlobalEntityId | null {
  return value != null ? (value as GlobalEntityId) : null
}
