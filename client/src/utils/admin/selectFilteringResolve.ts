/**
 * Pure resolution for select option filtering (extracted from useSelectFiltering for complexity bounds).
 */
import type { GlobalEntityKey } from '@/constants/entities'
import { TEMPORARY_ID_PATTERNS } from '@/constants/entityFieldConstants'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import type { GlobalEntity } from '@/types/entities'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'
import {
  filterByActiveChildSelect,
  filterByAttendeeSelectBlockInstances,
  filterByDirectMatching,
  mergeComponentOptions,
  type ValidChildrenKey,
} from '@/utils/admin/selectFilterStrategies'
import { createLogger } from '@/utils/logger'

const logger = createLogger('selectFilteringResolve')

/** Maps relationship field targetKey to allowlist on parent type (blockShape / partShape). */
const VALID_CHILDREN_KEY_BY_TARGET: Partial<Record<string, ValidChildrenKey>> = {
  bookingCascades: 'validCascades',
  partAssignments: 'validParts',
  annotationAssignments: 'validAnnotations',
  pricingCascades: 'validPricingCascades',
  eventAssignments: 'validEvents',
}

function resolveValidChildrenKey(fieldKey: string, selectConfig: unknown): ValidChildrenKey {
  const target =
    selectConfig &&
    typeof selectConfig === 'object' &&
    'targetKey' in selectConfig &&
    (selectConfig as { targetKey?: unknown }).targetKey != null
      ? String((selectConfig as { targetKey: string }).targetKey)
      : fieldKey
  const mapped = VALID_CHILDREN_KEY_BY_TARGET[target]
  if (mapped !== undefined) {
    return mapped
  }
  if (target === 'bookingCascades') {
    return 'validCascades'
  }
  logger.debug('resolveValidChildrenKey: unmapped target, falling back to validParts', { target, fieldKey })
  return 'validParts'
}

export interface ComponentEntityData {
  getAvailableComponents: (entityId: string) => GlobalEntity<GlobalEntityKey>[]
  getComponents: (entityId: string) => { childId: string }[]
}

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
    return resolveInstanceComponentsBranch(
      composedEntityData,
      allEntities,
      rawFieldValue,
      entityId
    )
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
    return resolveDirectMatchingBranch(
      allEntities,
      currentEntity,
      entityId,
      selectConfig,
      tryReadFormValue
    )
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

function resolveInstanceComponentsBranch(
  composedEntityData: ComponentEntityData,
  allEntities: GlobalEntity<GlobalEntityKey>[],
  rawFieldValue: unknown,
  entityId: string
): GlobalEntity<GlobalEntityKey>[] {
  const currentFormValue = rawFieldValue
  const selectedComponentIdsFromForm = new Set(
    Array.isArray(currentFormValue)
      ? currentFormValue.map((v) => String(v))
      : currentFormValue
        ? [String(currentFormValue)]
        : []
  )

  const availableComponents = composedEntityData.getAvailableComponents(entityId)
  const availableComponentsFiltered = availableComponents.filter(
    (component) => !selectedComponentIdsFromForm.has(component.id)
  )

  const currentComponents = composedEntityData.getComponents(entityId)
  const currentComponentIdsFromQuery = new Set(currentComponents.map((ea) => ea.childId))
  const allSelectedComponentIds = new Set([...currentComponentIdsFromQuery, ...selectedComponentIdsFromForm])

  const selectedComponentEntities =
    allSelectedComponentIds.size > 0
      ? allEntities.filter((candidate) => allSelectedComponentIds.has(candidate.id))
      : []

  return mergeComponentOptions(availableComponentsFiltered, selectedComponentEntities)
}

function resolveActiveChildBranch(
  allEntities: GlobalEntity<GlobalEntityKey>[],
  currentEntity: GlobalEntity<GlobalEntityKey> | undefined,
  entityId: string,
  parentTypeRef: string | null,
  parentTypeEntity: GlobalEntity<GlobalEntityKey> | null,
  fieldKey: string,
  selectConfig: RelationshipFieldType<GlobalEntityKey> | VirtualFieldType<GlobalEntityKey>,
  optionEntityKey: GlobalEntityKey
): GlobalEntity<GlobalEntityKey>[] {
  const entityIdString = String(entityId)
  const isTempEntity = entityIdString.startsWith(TEMPORARY_ID_PATTERNS.NEW_PREFIX)
  if (!currentEntity && !isTempEntity) {
    return []
  }
  if (!parentTypeRef || !parentTypeEntity) {
    return []
  }
  const validChildrenKey = resolveValidChildrenKey(fieldKey, selectConfig)
  return filterByActiveChildSelect(allEntities, parentTypeEntity, validChildrenKey, optionEntityKey)
}

function resolveDirectMatchingBranch(
  allEntities: GlobalEntity<GlobalEntityKey>[],
  currentEntity: GlobalEntity<GlobalEntityKey> | undefined,
  entityId: string,
  selectConfig: RelationshipFieldType<GlobalEntityKey> | VirtualFieldType<GlobalEntityKey>,
  tryReadFormValue: (key: string) => string | null
): GlobalEntity<GlobalEntityKey>[] {
  if (!('candidateParentPath' in selectConfig) || !('candidateChildPath' in selectConfig)) {
    return allEntities
  }
  const candidateParentPath = selectConfig.candidateParentPath
  const candidateChildPath = selectConfig.candidateChildPath
  if (!candidateParentPath?.length || !candidateChildPath?.length) {
    return allEntities
  }
  const parentPathKey = candidateParentPath[0]
  const childPathKey = candidateChildPath[0]

  let currentEntityValue: string | null = null
  if (currentEntity) {
    const refValue = getEntityFieldValue(currentEntity, String(parentPathKey))
    if (refValue) {
      currentEntityValue = String(refValue)
    }
  }

  if (!currentEntityValue) {
    const entityIdString = String(entityId)
    const isTempEntity = entityIdString.startsWith(TEMPORARY_ID_PATTERNS.NEW_PREFIX)
    if (isTempEntity || !currentEntity) {
      const fromForm = tryReadFormValue(String(parentPathKey))
      if (fromForm) {
        currentEntityValue = fromForm
      }
    }
  }

  if (!currentEntityValue) {
    return []
  }
  return filterByDirectMatching(
    allEntities,
    currentEntityValue,
    String(childPathKey),
    String(entityId)
  )
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

/** Resolve shape ref field key (blockShapeRef / partShapeRef path) from select config or entity. */
function resolveParentTypeRefKey(
  config: unknown,
  entityKey: GlobalEntityKey
): string {
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
