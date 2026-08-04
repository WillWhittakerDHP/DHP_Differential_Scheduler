import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import type {
  CollectionFieldConfig,
  CollectionFieldResolverContext,
} from '@/composables/admin/useBaseCollectionFieldTypes'

export function createRelationshipCollectionFieldConfig<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(composableName: string): CollectionFieldConfig<GE, GF> {
  return {
    composableName,
    resolveOptionsFieldKey: (selectConfig, relationshipKey) =>
      resolveRelationshipOptionsFieldKey(composableName, selectConfig, relationshipKey),
    resolveParentTypeProperty: (entityKey) => parentTypePropertyForRelationshipField(entityKey),
    resolveParentTypeEntityKey: (entityKey) => parentTypeEntityKeyForRelationshipField(entityKey),
    resolveParentTypeRef: (entityKey, entityId, parentEntity, parentTypeProperty) =>
      parentTypeRefForRelationshipField(entityKey, entityId, parentEntity, parentTypeProperty),
    resolveShouldDisplay: (ctx) => shouldDisplayRelationshipCollection(ctx),
  }
}

/**
 * Map instance relationship keys → shape-level validity fields.
 * Renames like validPartCascades broke the naive `*Assignments` → `valid*s` heuristic.
 */
const OPTIONS_FIELD_BY_RELATIONSHIP: Record<string, string> = {
  partAssignments: 'validPartCascades',
  bookingCascades: 'validBookingCascades',
  pricingCascades: 'validPricingCascades',
  eventAssignments: 'validEventCascades',
  annotationAssignments: 'validAnnotationAssignments',
}

/** Exported for unit tests — keeps Parts / cascade option lookups correct. */
export function resolveRelationshipOptionsFieldKey(
  composableName: string,
  selectConfig: { selectedChildPath?: unknown[] },
  relationshipKey: string
): string {
  const mapped = OPTIONS_FIELD_BY_RELATIONSHIP[relationshipKey]
  if (mapped) {
    return mapped
  }
  if (relationshipKey.endsWith('Assignments')) {
    const withoutAssignments = relationshipKey.replace(/Assignments$/, '')
    const pluralized = `${withoutAssignments}s`
    return `valid${pluralized.charAt(0).toUpperCase() + pluralized.slice(1)}`
  }
  if (
    selectConfig.selectedChildPath &&
    Array.isArray(selectConfig.selectedChildPath) &&
    selectConfig.selectedChildPath.length > 0
  ) {
    const lastPath = selectConfig.selectedChildPath[selectConfig.selectedChildPath.length - 1]
    if (typeof lastPath === 'string' && lastPath.startsWith('valid')) return lastPath
  }
  throw new Error(
    `[${composableName}] Cannot determine optionsFieldKey. RelationshipKey: ${relationshipKey}. ` +
      `Please configure optionsFieldKey in inputConfig or ensure relationshipKey follows '*Assignments' pattern.`
  )
}

function parentTypePropertyForRelationshipField(entityKey: GlobalEntityKey): string | null {
  if (entityKey === 'blockInstance') return 'blockShapeRef'
  if (entityKey === 'partInstance') return 'partShapeRef'
  if (entityKey === 'blockShape' || entityKey === 'partShape') return null
  return null
}

function parentTypeEntityKeyForRelationshipField(entityKey: GlobalEntityKey): GlobalEntityKey | null {
  if (entityKey === 'blockInstance') return 'blockShape'
  if (entityKey === 'partInstance') return 'partShape'
  if (entityKey === 'blockShape' || entityKey === 'partShape') return entityKey
  return null
}

function parentTypeRefForRelationshipField<GE extends GlobalEntityKey>(
  entityKey: GlobalEntityKey,
  entityId: string,
  parentEntity: GlobalEntity<GE> | undefined,
  parentTypeProperty: string | null
): string | null {
  if (entityKey === 'blockShape' || entityKey === 'partShape') return entityId
  if (!parentEntity || !parentTypeProperty) return null
  return getEntityFieldValue(parentEntity, parentTypeProperty) as string | null
}

function shouldDisplayRelationshipCollection<GE extends GlobalEntityKey>(
  ctx: CollectionFieldResolverContext<GE>
): boolean {
  if (ctx.entityKey === 'blockShape' || ctx.entityKey === 'partShape') {
    if (!ctx.parentEntity) return false
    const validOptions = getEntityFieldValue(ctx.parentEntity, ctx.optionsFieldKey)
    return Array.isArray(validOptions) && validOptions.length > 0
  }
  if (
    !ctx.parentEntity ||
    !ctx.parentTypeProperty ||
    !ctx.parentTypeRef ||
    !ctx.parentTypeEntity
  ) {
    return false
  }
  const validOptions = getEntityFieldValue(ctx.parentTypeEntity, ctx.optionsFieldKey)
  return Array.isArray(validOptions) && validOptions.length > 0
}
