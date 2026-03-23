import { computed, unref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { createLogger } from '@/utils/logger'
import { useFieldContextEntityDerivedThreaded } from '@/composables/fieldContext/useFieldContextEntityDerivedThreaded'
import { useFieldContextStateCore } from '@/composables/fieldContext/useFieldContextStateCore'
import { useFieldContextStateShell } from '@/composables/fieldContext/useFieldContextStateShell'
import type {
  UseFieldContextStateOptions,
  UseFieldContextStateReturnGrouped,
} from '@/types/fieldContext/fieldContextState'

const logger = createLogger('useFieldContextStateThreaded')

/**
 * Field context state when parent threads `fieldMetadata` (useFormFields); avoids useEntityMetadata → useMetadataCache chain.
 */
export function useFieldContextStateThreaded<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  fieldKey: FieldKey,
  entityKey: GE,
  entityId: GlobalEntityId,
  options: UseFieldContextStateOptions<GE, FieldKey>
): UseFieldContextStateReturnGrouped<GE, FieldKey> {
  const shell = useFieldContextStateShell(fieldKey, entityKey, entityId, options)
  const { resolvedOptions, isTempEntity, adminComp, composedEntityComposable, entity } = shell
  const { fieldMetadata: providedFieldMetadataRef } = resolvedOptions

  if (providedFieldMetadataRef === undefined) {
    logger.error('useFieldContextStateThreaded requires options.fieldMetadata', {
      entityKey,
      fieldKey: String(fieldKey),
      entityId: String(entityId),
    })
  }

  const fieldMetadata = computed(() => unref(providedFieldMetadataRef ?? {}))

  const { entityValue } = useFieldContextEntityDerivedThreaded<GE, FieldKey>({
    entityKey,
    fieldKey,
    entityId,
    isTempEntity,
    entity,
    composedEntityComposable,
    fieldMetadata,
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
