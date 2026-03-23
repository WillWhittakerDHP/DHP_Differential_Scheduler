/**
 * WHY: Pure distribution math + manual patch fan-out (useComponentEntity audit / FUNCTION playbook).
 */

import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalEntityKey } from '@/constants/entities'
import type { DistributionPreview, DistributionStrategy } from '@/types/component'
import apiClient from '@/utils/api'

type CalculateDistributionPreviewFn = (
  composerId: GlobalEntityId,
  propertyKey: string,
  newValue: number,
  strategy: DistributionStrategy
) => DistributionPreview[]

function mergePreviewIntoComponentUpdates(
  acc: Record<string, Record<string, unknown>>,
  previews: DistributionPreview[],
  propertyKey: string
): Record<string, Record<string, unknown>> {
  let next = acc
  for (const { componentId, newValue } of previews) {
    const id = String(componentId)
    const rawExisting = next[id]
    const existing = rawExisting !== undefined && rawExisting !== null ? rawExisting : {}
    next = {
      ...next,
      [id]: {
        ...existing,
        [propertyKey]: newValue,
      },
    }
  }
  return next
}

export function buildNumericChangeDistributionMap(input: {
  changes: Record<string, unknown>
  composerId: GlobalEntityId
  distributionStrategy: DistributionStrategy
  calculateDistributionPreview: CalculateDistributionPreviewFn
}): Record<string, Record<string, unknown>> {
  const { changes, composerId, distributionStrategy, calculateDistributionPreview } = input
  let acc: Record<string, Record<string, unknown>> = {}
  for (const [propertyKey, newValue] of Object.entries(changes)) {
    if (typeof newValue !== 'number') {
      continue
    }
    const preview = calculateDistributionPreview(
      composerId,
      propertyKey,
      newValue,
      distributionStrategy
    )
    acc = mergePreviewIntoComponentUpdates(acc, preview, propertyKey)
  }
  return acc
}

export async function runManualDistributionPatches(input: {
  entityKey: GlobalEntityKey
  distributionValues: Record<string, Record<string, unknown>>
}): Promise<void> {
  const { entityKey, distributionValues } = input
  const promises = Object.entries(distributionValues).map(([componentId, componentChanges]) =>
    apiClient.patch(`/api/internal/entities/${entityKey}/${componentId}`, componentChanges)
  )
  await Promise.all(promises)
}

export async function patchComponentUpdatesById(input: {
  entityKey: GlobalEntityKey
  componentUpdates: Record<string, Record<string, unknown>>
}): Promise<void> {
  const { entityKey, componentUpdates } = input
  const promises = Object.entries(componentUpdates).map(([componentId, componentChanges]) =>
    apiClient.patch(`/api/internal/entities/${entityKey}/${componentId}`, componentChanges)
  )
  await Promise.all(promises)
}
