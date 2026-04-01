/**
 * Branch implementations for select option filtering (file-cohesion: split from selectFilteringResolve).
 */
import { TEMPORARY_ID_PATTERNS } from '@/constants/entityFieldConstants'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'
import {
  filterByActiveChildSelect,
  filterByDirectMatching,
  mergeComponentOptions,
  type ValidChildrenKey,
} from '@/utils/admin/selectFilterStrategies'
import { createLogger } from '@/utils/logger'
import type { ComponentEntityData } from '@/utils/admin/selectFilteringResolveTypes'

const logger = createLogger('selectFilteringResolveBranches')

const VALID_CHILDREN_KEY_BY_TARGET: Partial<Record<string, ValidChildrenKey>> = {
  bookingCascades: 'validBookingCascades',
  partAssignments: 'validPartCascades',
  annotationAssignments: 'validAnnotationAssignments',
  pricingCascades: 'validPricingCascades',
  eventAssignments: 'validEventCascades',
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
    return 'validBookingCascades'
  }
  logger.debug('resolveValidChildrenKey: unmapped target, falling back to validPartCascades', { target, fieldKey })
  return 'validPartCascades'
}

export function resolveInstanceComponentsBranch(
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

export function resolveActiveChildBranch(
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

export function resolveDirectMatchingBranch(
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
