/**
 * Pure resolution for select option filtering (extracted from useSelectFiltering for complexity bounds).
 */
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import { filterByAttendeeSelectBlockInstances } from '@/utils/admin/selectFilterStrategies'
import { TEMPORARY_ID_PATTERNS } from '@/constants/entityFieldConstants'
import {
  resolveActiveChildBranch,
  resolveDirectMatchingBranch,
  resolveInstanceComponentsBranch,
} from '@/utils/admin/selectFilteringResolveBranches'
import type { ComponentEntityData } from '@/utils/admin/selectFilteringResolveTypes'

export type { ComponentEntityData } from '@/utils/admin/selectFilteringResolveTypes'

interface SelectFilteringResolveInput {
  selectConfig: RelationshipFieldType<GlobalEntityKey> | VirtualFieldType<GlobalEntityKey> | undefined
  allEntities: GlobalEntity<GlobalEntityKey>[]
  currentEntity: GlobalEntity<GlobalEntityKey> | undefined
  optionEntityKey: GlobalEntityKey
  entityId: string
  fieldKey: string
  rawFieldValue: unknown
  isAnnotationAssignmentSelect: boolean
  isAttendeeSelect: boolean
  isActiveChildSelect: boolean
  isDirectMatchingSelect: boolean
  parentTypeRef: string | null
  parentTypeEntity: GlobalEntity<GlobalEntityKey> | null
  composedEntityData: ComponentEntityData | null
  tryReadFormValue: (key: string) => string | null
  getStateControlBlockShapeIds: () => Set<string>
}

export function resolveFilteredEntities(input: SelectFilteringResolveInput): GlobalEntity<GlobalEntityKey>[] {
  const {
    selectConfig,
    allEntities,
    currentEntity,
    optionEntityKey,
    entityId,
    fieldKey,
    rawFieldValue,
    isAnnotationAssignmentSelect,
    isAttendeeSelect,
    isActiveChildSelect,
    isDirectMatchingSelect,
    parentTypeRef,
    parentTypeEntity,
    composedEntityData,
    tryReadFormValue,
    getStateControlBlockShapeIds,
  } = input

  if (!selectConfig) {
    return allEntities
  }

  if (composedEntityData && entityId) {
    return resolveInstanceComponentsBranch(composedEntityData, allEntities, rawFieldValue, entityId)
  }

  if (isActiveChildSelect) {
    return resolveActiveChildBranch(
      allEntities,
      currentEntity,
      entityId,
      parentTypeRef,
      parentTypeEntity,
      fieldKey,
      selectConfig,
      optionEntityKey
    )
  }

  if (isDirectMatchingSelect) {
    return resolveDirectMatchingBranch(allEntities, currentEntity, entityId, selectConfig, tryReadFormValue)
  }

  if (isAnnotationAssignmentSelect) {
    return allEntities
  }

  if (isAttendeeSelect && optionEntityKey === 'blockInstance') {
    return filterByAttendeeSelectBlockInstances(allEntities, getStateControlBlockShapeIds())
  }

  if ('filterOptions' in selectConfig && typeof selectConfig.filterOptions === 'function' && currentEntity) {
    const fn = selectConfig.filterOptions as (candidate: unknown, currentEntity: unknown) => boolean
    return allEntities.filter((candidate) => fn(candidate, currentEntity))
  }

  return allEntities
}

export function resolveParentTypeEntityKey(
  config: unknown,
  entityKey: GlobalEntityKey
): GlobalEntityKey | null {
  if (
    config &&
    typeof config === 'object' &&
    'candidateParentKey' in config &&
    (config as { candidateParentKey?: unknown }).candidateParentKey
  ) {
    return (config as { candidateParentKey: GlobalEntityKey }).candidateParentKey
  }
  if (entityKey === 'blockInstance') {
    return 'blockShape' as GlobalEntityKey
  }
  if (entityKey === 'partInstance') {
    return 'partShape' as GlobalEntityKey
  }
  return null
}

function resolveParentTypeRefKey(config: unknown, entityKey: GlobalEntityKey): string {
  if (
    config &&
    typeof config === 'object' &&
    'candidateParentPath' in config &&
    Array.isArray((config as { candidateParentPath?: unknown }).candidateParentPath) &&
    (config as { candidateParentPath: unknown[] }).candidateParentPath.length > 0
  ) {
    return String((config as { candidateParentPath: string[] }).candidateParentPath[0])
  }
  return entityKey === 'blockInstance' ? 'blockShapeRef' : 'partShapeRef'
}

export function resolveParentTypeRefString(
  config: unknown,
  entityKey: GlobalEntityKey,
  currentEntity: GlobalEntity<GlobalEntityKey> | undefined,
  entityId: string,
  tryReadFormValue: (key: string) => string | null
): string | null {
  const typeRefKey = resolveParentTypeRefKey(config, entityKey)
  if (currentEntity) {
    const refValue = getEntityFieldValue(currentEntity, typeRefKey)
    if (refValue) {
      return String(refValue)
    }
  }
  const entityIdString = String(entityId)
  const isTempEntity = entityIdString.startsWith(TEMPORARY_ID_PATTERNS.NEW_PREFIX)
  if (isTempEntity || !currentEntity) {
    const fromForm = tryReadFormValue(typeRefKey)
    if (fromForm) {
      return fromForm
    }
  }
  return null
}
