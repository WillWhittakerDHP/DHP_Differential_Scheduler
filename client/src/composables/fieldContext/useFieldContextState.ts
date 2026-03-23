import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { useFieldContextEntityDerived } from '@/composables/fieldContext/useFieldContextEntityDerived'
import { useFieldContextStateCore } from '@/composables/fieldContext/useFieldContextStateCore'
import { useFieldContextStateShell } from '@/composables/fieldContext/useFieldContextStateShell'
import type {
  UseFieldContextStateOptions,
  UseFieldContextStateReturnGrouped,
} from '@/types/fieldContext/fieldContextState'

/**
 * WHY: State + actions module for `useFieldContext` (single field context core).
 */
export function useFieldContextState<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  fieldKey: FieldKey,
  entityKey: GE,
  entityId: GlobalEntityId,
  options?: UseFieldContextStateOptions<GE, FieldKey>
): UseFieldContextStateReturnGrouped<GE, FieldKey> {
  const shell = useFieldContextStateShell(fieldKey, entityKey, entityId, options)
  const { resolvedOptions, isTempEntity, adminComp, composedEntityComposable, entity } = shell
  const { fieldMetadata: providedFieldMetadataRef } = resolvedOptions

  const { entityValue } = useFieldContextEntityDerived<GE, FieldKey>({
    entityKey,
    fieldKey,
    entityId,
    isTempEntity,
    entity,
    composedEntityComposable,
    fieldMetadata: providedFieldMetadataRef,
  })

  return useFieldContextStateCore({
    fieldKey,
    entityKey,
    entityId,
    resolvedOptions,
    entityValue,
    entity,
    isTempEntity,
    composedEntityComposable,
    adminComp,
  })
}
