import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'

/**
 * Normalizes optional field-key arrays from form options (refs / configs).
 */
export function readGlobalFieldKeyArray<GE extends GlobalEntityKey>(value: unknown): GlobalFieldKey<GE>[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value as GlobalFieldKey<GE>[]
}

/**
 * Reads field keys from an optional inline/stacked config ref.
 */
export function readFieldKeysFromOptionalConfigRef<GE extends GlobalEntityKey>(
  cfg: { value: unknown } | undefined
): GlobalFieldKey<GE>[] {
  if (cfg === undefined) {
    return []
  }
  return readGlobalFieldKeyArray<GE>(cfg.value)
}
