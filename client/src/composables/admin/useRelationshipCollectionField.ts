/**
 * PATTERN: useRelationshipCollectionField Composable
 * Delegates to useBaseCollectionField with Relationship-specific config (dynamic optionsFieldKey, shape-entity handling).
 */
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import {
  useBaseCollectionField,
  type UseBaseCollectionFieldReturn,
} from './useBaseCollectionField'
import { createRelationshipCollectionFieldConfig } from '@/utils/admin/relationshipCollectionFieldConfig'

type UseRelationshipCollectionFieldReturn<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
> = UseBaseCollectionFieldReturn<GE, GF>

export function useRelationshipCollectionField<
  GE extends GlobalEntityKey,
  GF extends GlobalFieldKey<GE>
>(fieldContext: FieldContextTypeGrouped<GE, GF>): UseRelationshipCollectionFieldReturn<GE, GF> {
  return useBaseCollectionField(
    fieldContext,
    createRelationshipCollectionFieldConfig<GE, GF>('useRelationshipCollectionField')
  )
}
