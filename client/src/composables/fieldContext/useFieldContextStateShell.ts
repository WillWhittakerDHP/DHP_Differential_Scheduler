import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import { TEMPORARY_ID_PATTERNS } from '@/constants/entityFieldConstants'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { useAdmin, type UseAdminReturn } from '@/composables/admin/useAdmin'
import { useComponentEntity } from '@/composables/useComponentEntity'
import type { ComposedEntityLike } from '@/types/fieldContext/composedEntityLike'
import { asEmptyObject } from '@/utils/safeDefaults'
import type {
  UseFieldContextStateOptions,
} from '@/types/fieldContext/fieldContextState'

interface UseFieldContextStateShell<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>> {
  resolvedOptions: UseFieldContextStateOptions<GE, FieldKey>
  isTempEntity: ComputedRef<boolean>
  adminComp: UseAdminReturn
  composedEntityComposable: ComposedEntityLike | null
  entity: ComputedRef<unknown>
}

/**
 * Shared admin + entity resolution before entityValue derivation (cache vs threaded metadata).
 */
export function useFieldContextStateShell<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  fieldKey: FieldKey,
  entityKey: GE,
  entityId: GlobalEntityId,
  options?: UseFieldContextStateOptions<GE, FieldKey>
): UseFieldContextStateShell<GE, FieldKey> {
  const resolvedOptions = asEmptyObject(options as Record<string, unknown> | null | undefined) as UseFieldContextStateOptions<
    GE,
    FieldKey
  >

  const isTempEntity = computed(() => {
    if (!entityId) return true
    return String(entityId).startsWith(TEMPORARY_ID_PATTERNS.NEW_PREFIX)
  })

  const adminComp = useAdmin()

  const composedEntityComposable =
    String(fieldKey) === 'instanceComponents' && entityKey === 'blockInstance'
      ? useComponentEntity('blockInstance')
      : null

  const entity = computed(() => {
    if (isTempEntity.value) {
      return undefined
    }
    return adminComp.getEntity(entityKey, entityId)
  })

  return {
    resolvedOptions,
    isTempEntity,
    adminComp,
    composedEntityComposable,
    entity,
  }
}
