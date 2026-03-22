/**
 * PATTERN: useRelationshipCollectionField Composable
 * Delegates to useBaseCollectionField with Relationship-specific config (dynamic optionsFieldKey, shape-entity handling).
 */
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import {
  useBaseCollectionField,
  type UseBaseCollectionFieldReturn,
  type CollectionFieldConfig,
} from './useBaseCollectionField'

export type UseRelationshipCollectionFieldReturn<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
> = UseBaseCollectionFieldReturn<GE, GF>

function createRelationshipCollectionFieldConfig<GE extends GlobalEntityKey, GF extends GlobalFieldKey<GE>>(
  composableName: string
): CollectionFieldConfig<GE, GF> {
  return {
    composableName,
    resolveOptionsFieldKey: (selectConfig, relationshipKey) => {
      if (relationshipKey.endsWith('Assignments')) {
        const withoutAssignments = relationshipKey.replace(/Assignments$/, '')
        const pluralized = `${withoutAssignments}s`
        const capitalized = pluralized.charAt(0).toUpperCase() + pluralized.slice(1)
        return `valid${capitalized}`
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
    },
    resolveParentTypeProperty: (entityKey) => {
      if (entityKey === 'blockInstance') return 'blockShapeRef'
      if (entityKey === 'partInstance') return 'partShapeRef'
      if (entityKey === 'blockShape' || entityKey === 'partShape') return null
      return null
    },
    resolveParentTypeEntityKey: (entityKey) => {
      if (entityKey === 'blockInstance') return 'blockShape' as GlobalEntityKey
      if (entityKey === 'partInstance') return 'partShape' as GlobalEntityKey
      if (entityKey === 'blockShape' || entityKey === 'partShape') return entityKey
      return null
    },
    resolveParentTypeRef: (entityKey, entityId, parentEntity, parentTypeProperty) => {
      if (entityKey === 'blockShape' || entityKey === 'partShape') return entityId
      if (!parentEntity || !parentTypeProperty) return null
      return getEntityFieldValue(parentEntity, parentTypeProperty) as string | null
    },
    resolveShouldDisplay: (ctx): boolean => {
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
    },
  }
}

export function useRelationshipCollectionField<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(fieldContext: FieldContextTypeGrouped<GE, GF>): UseRelationshipCollectionFieldReturn<GE, GF> {
  return useBaseCollectionField(
    fieldContext,
    createRelationshipCollectionFieldConfig<GE, GF>('useRelationshipCollectionField')
  )
}
