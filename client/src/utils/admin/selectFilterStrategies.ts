/**
 * Pure filter strategies for select entity lists.
 * each strategy is a focused, testable function.
 */

import type { GlobalEntityKey } from '@/constants/entities'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import { createLogger } from '@/utils/logger'

const logger = createLogger('selectFilterStrategies')

/** Type for valid-children allowlist field on a parent shape (blockShape or partShape for pricing). */
export type ValidChildrenKey =
  | 'validCascades'
  | 'validParts'
  | 'validAnnotations'
  | 'validEvents'
  | 'validPricingCascades'

/** Maps option entity kind to the FK field that points at its shape (for allowlist filtering). */
const CANDIDATE_TYPE_REF_BY_OPTION_ENTITY: Partial<Record<GlobalEntityKey, string>> = {
  blockInstance: 'blockShapeRef',
  partInstance: 'partShapeRef',
  eventInstance: 'eventShapeRef',
  annotationInstance: 'annotationShapeRef',
}

/**
 * WHY: eventInstance uses eventShapeRef, not partShapeRef; hardcoding block vs part only broke eventAssignments.
 */
function resolveCandidateTypeRefKey(optionEntityKey: GlobalEntityKey): string {
  const key = CANDIDATE_TYPE_REF_BY_OPTION_ENTITY[optionEntityKey]
  if (key !== undefined) {
    return key
  }
  logger.warn('resolveCandidateTypeRefKey: unknown optionEntityKey, defaulting partShapeRef', {
    optionEntityKey,
  })
  return 'partShapeRef'
}

/**
 * Filter entities by active-child select: only those whose type ref is in the parent's valid children.
 */
export function filterByActiveChildSelect(
  allEntities: GlobalEntity<GlobalEntityKey>[],
  parentTypeEntity: GlobalEntity<GlobalEntityKey>,
  validChildrenKey: string,
  optionEntityKey: GlobalEntityKey
): GlobalEntity<GlobalEntityKey>[] {
  const validChildrenRefs = getEntityFieldValue(parentTypeEntity, validChildrenKey)
  if (validChildrenRefs === undefined || !Array.isArray(validChildrenRefs) || validChildrenRefs.length === 0) {
    if (validChildrenKey === 'validCascades') {
      logger.debug('[hypothesis A] validCascades empty or missing', {
        parentShapeId: parentTypeEntity?.id,
        validChildrenKey,
        validChildrenRefsType: typeof validChildrenRefs,
        validChildrenRefsLength: Array.isArray(validChildrenRefs) ? validChildrenRefs.length : 0
      })
    }
    return []
  }
  const validChildrenSet = new Set(validChildrenRefs.map((id: unknown) => String(id)))
  const candidateTypeRefKey = resolveCandidateTypeRefKey(optionEntityKey)

  if (validChildrenKey === 'validCascades') {
    const uniqueCandidateRefs = new Set<string>()
    const rejectedRefs = new Set<string>()
    allEntities.forEach((candidate) => {
      const ref = getEntityFieldValue(candidate, candidateTypeRefKey)
      if (ref != null) {
        const refStr = String(ref)
        uniqueCandidateRefs.add(refStr)
        if (!validChildrenSet.has(refStr)) rejectedRefs.add(refStr)
      }
    })
    logger.debug('[hypothesis A] validCascades filter', {
      parentShapeId: parentTypeEntity?.id,
      validCascadesIds: [...validChildrenSet],
      allEntitiesCount: allEntities.length,
      uniqueBlockShapeRefsInInstances: [...uniqueCandidateRefs],
      rejectedBlockShapeRefsNotInValidCascades: rejectedRefs.size > 0 ? [...rejectedRefs] : undefined
    })
  }

  return allEntities.filter((candidate) => {
    const candidateTypeRef = getEntityFieldValue(candidate, candidateTypeRefKey)
    return candidateTypeRef != null && validChildrenSet.has(String(candidateTypeRef))
  })
}

/**
 * Filter entities by direct matching: candidate's path value must equal current entity value; exclude self.
 */
export function filterByDirectMatching(
  allEntities: GlobalEntity<GlobalEntityKey>[],
  currentEntityValue: string,
  childPathKey: string,
  excludeEntityId: string
): GlobalEntity<GlobalEntityKey>[] {
  return allEntities.filter((candidate) => {
    if (candidate.id === excludeEntityId) return false
    const candidateValue = getEntityFieldValue(candidate, childPathKey)
    return candidateValue != null && String(candidateValue) === currentEntityValue
  })
}

/**
 * Filter block instances to only those whose blockShapeRef is in the state-control block shape set.
 */
export function filterByAttendeeSelectBlockInstances(
  allEntities: GlobalEntity<GlobalEntityKey>[],
  stateControlBlockShapeIds: Set<string>
): GlobalEntity<GlobalEntityKey>[] {
  return allEntities.filter((candidate) => {
    const blockShapeRef = getEntityFieldValue(candidate, 'blockShapeRef')
    if (!blockShapeRef) return false
    return stateControlBlockShapeIds.has(toGlobalEntityId(String(blockShapeRef)))
  })
}

/**
 * Merge available (filtered) components with selected component entities and dedupe by id.
 */
export function mergeComponentOptions(
  availableFiltered: GlobalEntity<GlobalEntityKey>[],
  selectedEntities: GlobalEntity<GlobalEntityKey>[]
): GlobalEntity<GlobalEntityKey>[] {
  const byId = new Map<string, GlobalEntity<GlobalEntityKey>>()
  for (const c of availableFiltered) {
    if (!byId.has(c.id)) byId.set(c.id, c)
  }
  for (const c of selectedEntities) {
    if (!byId.has(c.id)) byId.set(c.id, c)
  }
  return Array.from(byId.values())
}
