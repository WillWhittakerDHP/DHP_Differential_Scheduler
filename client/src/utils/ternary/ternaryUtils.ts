
import type { TernaryBoolean } from '@/types/ternary'

export function aggregate(values: TernaryBoolean[]): TernaryBoolean {
  if (values.length === 0) {
    return 'false'
  }
  
  if (values.some(v => v === 'override')) {
    return 'override'
  }
  
  if (values.some(v => v === 'true')) {
    return 'true'
  }
  
  return 'false'
}

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
