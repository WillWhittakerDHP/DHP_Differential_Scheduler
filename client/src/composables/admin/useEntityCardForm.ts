/**
 * WHY: Entity Card Form Owner Composable
WHY: Keeps form creation and store syn...
 */
import { computed, type Ref, type ComputedRef } from 'vue'
import { useForm, type FormContext } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import { toGlobalEntityId } from '@/types/entities'
import { useAdmin } from '@/composables/admin/useAdmin'
import { useEntityCardStoreSync } from '@/composables/admin/useEntityCardStoreSync'
import { createLogger, isScopeExplicitlyEnabled } from '@/utils/logger'

const logger = createLogger('useEntityCardForm')

export interface UseEntityCardFormOptions<GE extends GlobalEntityKey = GlobalEntityKey> {
  entityKey: GE
  entity: Ref<GlobalEntity<GE>> | GlobalEntity<GE>
  entityId: Ref<string> | ComputedRef<string>
  isNew: boolean
  /** When parent provides form (e.g. shared expansion panel), use it instead of creating */
  form?: FormContext
}

export interface UseEntityCardFormReturn {
  form: Ref<FormContext | undefined>
}

export function useEntityCardForm<GE extends GlobalEntityKey = GlobalEntityKey>(
  options: UseEntityCardFormOptions<GE>
): UseEntityCardFormReturn {
  const { entityKey, entity: entityOption, entityId, isNew, form: providedForm } = options

  const admin = useAdmin()
  const entityRef = 'value' in entityOption ? entityOption : computed(() => entityOption)

  let form: Ref<FormContext | undefined>
  if (providedForm) {
    form = computed(() => providedForm) as Ref<FormContext | undefined>
  } else {
    const entity = entityRef.value
    const formInstance = useForm({
      initialValues: {
        ...(typeof entity === 'object' && entity !== null ? entity : {}),
      },
    })
    formInstance.setValues({
      ...(typeof entity === 'object' && entity !== null ? entity : {}),
    })
    if (isScopeExplicitlyEnabled('useEntityCardForm')) {
      logger.debug('Form initialized', {
        entityKey,
        entityId: 'value' in entityId ? entityId.value : undefined,
        isNew,
        initialValues: typeof entity === 'object' && entity !== null ? Object.keys(entity) : [],
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
    form = computed(() => formInstance as FormContext) as Ref<FormContext | undefined>
  }

  return { form }
}
