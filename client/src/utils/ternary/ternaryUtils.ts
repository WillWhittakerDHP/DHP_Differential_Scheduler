import type { TernaryBoolean } from '@/types/ternary'

/**
 * WHY: Compare ternary value to specific state
 */
export function equals(value: TernaryBoolean, state: TernaryBoolean): boolean {
  return value === state
}
