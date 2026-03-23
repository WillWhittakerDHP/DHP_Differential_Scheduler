/**
 * WHY: Numeric distribution strategies for component property preview (pure).
 */

import type { DistributionStrategy } from '@/types/component'

export function distributionValuesForStrategy(
  strategy: DistributionStrategy,
  currentValues: number[],
  newValue: number
): number[] {
  const totalCurrent = currentValues.reduce((sum, val) => sum + val, 0)

  if (strategy === 'proportional') {
    if (totalCurrent === 0) {
      const equalValue = newValue / currentValues.length
      return currentValues.map(() => equalValue)
    }
    return currentValues.map((current) => (current / totalCurrent) * newValue)
  }

  if (strategy === 'equal') {
    const equalValue = newValue / currentValues.length
    return currentValues.map(() => equalValue)
  }

  return currentValues
}
