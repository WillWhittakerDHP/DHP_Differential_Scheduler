/**
 * PATTERN: usePartsCollectionField Composable
 * Delegates to useBaseCollectionField with Parts-specific config (hardcoded validParts, instance-only type resolution).
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

export type UsePartsCollectionFieldReturn<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
> = UseBaseCollectionFieldReturn<GE, GF>

const partsConfig: CollectionFieldConfig<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> = {
  composableName: 'usePartsCollectionField',
  resolveOptionsFieldKey: () => 'validParts',
  resolveParentTypeProperty: (entityKey) => {
    if (entityKey === 'blockInstance') return 'blockShapeRef'
    if (entityKey === 'partInstance') return 'partShapeRef'
    return null
  },
  resolveParentTypeEntityKey: (entityKey) => {
    if (entityKey === 'blockInstance') return 'blockShape' as GlobalEntityKey
    if (entityKey === 'partInstance') return 'partShape' as GlobalEntityKey
    return null
  },
  resolveParentTypeRef: (_entityKey, _entityId, parentEntity, parentTypeProperty) => {
    if (!parentEntity || !parentTypeProperty) return null
    return getEntityFieldValue(parentEntity, parentTypeProperty) as string | null
  },
  resolveShouldDisplay: (ctx): boolean => {
    if (!ctx.parentEntity || !ctx.parentTypeProperty || !ctx.parentTypeRef || !ctx.parentTypeEntity) {
      return false
    }
    const validOptions = getEntityFieldValue(ctx.parentTypeEntity, ctx.optionsFieldKey)
    return Array.isArray(validOptions) && validOptions.length > 0
  },
}

export function usePartsCollectionField<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(fieldContext: FieldContextTypeGrouped<GE, GF>): UsePartsCollectionFieldReturn<GE, GF> {
  return useBaseCollectionField(fieldContext, partsConfig as CollectionFieldConfig<GE, GF>)
}
