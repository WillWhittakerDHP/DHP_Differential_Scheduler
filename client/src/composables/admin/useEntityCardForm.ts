/**
 * WHY: Entity Card Form Owner Composable
WHY: Keeps form creation and store syn...
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import { useForm, type FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntity } from '@/types/entities'
import { useAdmin } from '@/composables/admin/useAdmin'
import { useEntityCardStoreSync } from '@/composables/admin/useEntityCardStoreSync'
import { createLogger, isScopeExplicitlyEnabled } from '@/utils/logger'
import type { UseEntityCardFormOptions, UseEntityCardFormReturn } from '@/types/admin/entityCardForm'

const logger = createLogger('useEntityCardForm')

function shallowCopyEntityFields(entity: unknown): Record<string, unknown> {
  return typeof entity === 'object' && entity !== null ? { ...(entity as object) } : {}
}

interface MountEntityCardFormParams<GE extends GlobalEntityKey> {
  entityKey: GE
  entityRef: Ref<GlobalEntity<GE>>
  entityId: Ref<string> | ComputedRef<string>
  isNew: boolean
}

function mountEntityCardFormWithoutProvided<GE extends GlobalEntityKey>(
  params: MountEntityCardFormParams<GE>,
  admin: ReturnType<typeof useAdmin>
): Ref<FormContext | undefined> {
  const { entityKey, entityRef, entityId, isNew } = params
  const entity = entityRef.value
  const initial = shallowCopyEntityFields(entity)
  const formInstance = useForm({
    initialValues: initial,
  })
  formInstance.setValues(initial)

  if (isScopeExplicitlyEnabled('useEntityCardForm')) {
    logger.debug('Form initialized', {
      entityKey,
      entityId: 'value' in entityId ? entityId.value : undefined,
      isNew,
      initialValues: typeof entity === 'object' && entity !== null ? Object.keys(entity as object) : [],
    })
  }

  if (!isNew) {
    const getStoreEntity = (): GlobalEntity<GE> | undefined => {
      const id = 'value' in entityId ? entityId.value : ''
      return (admin.getEntity(entityKey, toGlobalEntityId(id)) as GlobalEntity<GE> | undefined) ?? undefined
    }
    const initialEntity = entityRef.value as GlobalEntity<GE>
    useEntityCardStoreSync({
      entityKey,
      entityId,
      form: formInstance,
      isNew,
      getStoreEntity,
      initialEntity,
    })
  }

  return computed(() => formInstance as FormContext)
}

export function useEntityCardForm<GE extends GlobalEntityKey = GlobalEntityKey>(
  options: UseEntityCardFormOptions<GE>
): UseEntityCardFormReturn {
  const { entityKey, entity: entityOption, entityId, isNew, form: providedForm } = options

  const admin = useAdmin()
  const entityRef = (
    'value' in entityOption ? entityOption : computed(() => entityOption)
  ) as Ref<GlobalEntity<GE>>

  const form: Ref<FormContext | undefined> = providedForm
    ? computed(() => providedForm)
    : mountEntityCardFormWithoutProvided({ entityKey, entityRef, entityId, isNew }, admin)

  return { form }
}
