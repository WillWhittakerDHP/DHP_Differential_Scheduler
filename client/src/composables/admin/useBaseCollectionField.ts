/**
 * PATTERN: Base composable for collection field logic shared by useRelationshipCollectionField.
 * WHY: ~85% of both composables was identical; config object injects only the divergent parts (optionsFieldKey, parent type resolution, shouldDisplay).
 */
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import { useBaseCollectionFieldCore } from '@/composables/admin/useBaseCollectionFieldCore'
import { useBaseCollectionFieldBindings } from '@/composables/admin/useBaseCollectionFieldBindings'
import type {
  CollectionFieldConfig,
  UseBaseCollectionFieldReturn,
} from '@/composables/admin/useBaseCollectionFieldTypes'

export type {
  BaseCollectionFieldParentContext,
  CollectionFieldConfig,
  CollectionFieldResolverContext,
  UseBaseCollectionFieldReturn,
} from '@/composables/admin/useBaseCollectionFieldTypes'

export function useBaseCollectionField<
  GE extends GlobalEntityKey,
  _GF extends GlobalFieldKey<GE>
>(
  fieldContext: FieldContextTypeGrouped<GE, _GF>,
  config: CollectionFieldConfig<GE, _GF>
): UseBaseCollectionFieldReturn<GE, _GF> {
  const core = useBaseCollectionFieldCore(fieldContext, config)
  return useBaseCollectionFieldBindings(core)
}
