/**
 * Pure helpers for component value distribution preview and field reads.
 * WHY: Moves branchy logic out of useComponentDistribution for complexity audit.
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { DistributionPreview, DistributionStrategy } from '@/types/component'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'

function readDistributionNumericFieldCore(
  globalData: GlobalData | null | undefined,
  entityKey: GlobalEntityKey,
  componentId: GlobalEntityId,
  propertyKey: string
): number {
  if (!globalData) {
    return 0
  }

  const component = globalData.entities[entityKey]?.find((e) => e.id === componentId)
  if (!component) {
    return 0
  }

  const value = getEntityFieldValue(component, propertyKey)
  return typeof value === 'number' ? value : 0
}

export function readDistributionNumericField(
  globalData: GlobalData | null | undefined,
  entityKey: GlobalEntityKey,
  componentId: GlobalEntityId,
  propertyKey: string
): number {
  return readDistributionNumericFieldCore(globalData, entityKey, componentId, propertyKey)
}

export function readDistributionComponentLabel(
  globalData: GlobalData | null | undefined,
  entityKey: GlobalEntityKey,
  componentId: GlobalEntityId
): string {
  if (!globalData) {
    return componentId
  }

  const component = globalData.entities[entityKey]?.find((e) => e.id === componentId)
  return component?.name ?? componentId
}

export function formatDistributionDecimal(value: number): string {
  if (typeof value !== 'number') {
    return String(value)
  }
  return value.toFixed(2)
}

function buildManualDistributionPreviewRows(
  globalData: GlobalData | null | undefined,
  entityKey: GlobalEntityKey,
  componentIds: GlobalEntityId[],
  manualValues: Record<GlobalEntityId, number>,
  propertyKey: string
): DistributionPreview[] {
  if (!globalData) {
    return []
  }

  return componentIds.map((componentId) => {
    const currentValue = readDistributionNumericFieldCore(globalData, entityKey, componentId, propertyKey)
    const manualValue = manualValues[componentId] ?? currentValue
    return {
      componentId,
      currentValue,
      newValue: manualValue,
      change: manualValue - currentValue,
    }
  })
}

export function mergeManualValuesForStrategySwitch(
  globalData: GlobalData | null | undefined,
  entityKey: GlobalEntityKey,
  componentIds: GlobalEntityId[],
  existingManual: Record<GlobalEntityId, number>,
  propertyKey: string
): Record<GlobalEntityId, number> {
  if (!globalData) {
    return existingManual
  }

  return componentIds.reduce<Record<GlobalEntityId, number>>((acc, componentId) => {
    if (!(componentId in existingManual)) {
      acc[componentId] = readDistributionNumericFieldCore(globalData, entityKey, componentId, propertyKey)
    } else {
      acc[componentId] = existingManual[componentId]
    }
    return acc
  }, {})
}

export function computeDistributionPreview(
  distributionStrategy: string,
  globalData: GlobalData | null | undefined,
  entityKey: GlobalEntityKey,
  componentIds: GlobalEntityId[],
  manualValues: Record<GlobalEntityId, number>,
  propertyKey: string,
  newValue: number,
  calculateDistributionPreview: (
    composerId: GlobalEntityId,
    pk: string,
    nv: number,
    strategy: DistributionStrategy
  ) => DistributionPreview[],
  composerId: GlobalEntityId
): DistributionPreview[] {
  if (distributionStrategy === 'manual') {
    return buildManualDistributionPreviewRows(
      globalData,
      entityKey,
      componentIds,
      manualValues,
      propertyKey
    )
  }

  return calculateDistributionPreview(
    composerId,
    propertyKey,
    newValue,
    distributionStrategy as DistributionStrategy
  )
}
