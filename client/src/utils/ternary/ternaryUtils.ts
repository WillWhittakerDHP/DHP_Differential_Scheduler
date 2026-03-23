
import type { TernaryBoolean } from '@/types/ternary'

export function toBoolean(value: TernaryBoolean, mode?: 'strict' | 'inclusive'): boolean {
  const resolvedMode = mode !== undefined ? mode : 'strict'
  if (resolvedMode === 'strict') {
    return value === 'true'
  }
  
  return value === 'true' || value === 'override'
}

/**
 * WHY: Compare ternary value to specific state
 */
export function equals(value: TernaryBoolean, state: TernaryBoolean): boolean {
  return value === state
}
