/**
 * Annotation multi–user-type text editor: hydrate from entity, sync vee-validate contentRows + text.
 * WHY: Moves watch/async-adjacent logic out of the Vue SFC (component-logic).
 */
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { FormContext } from 'vee-validate'
import { useAdmin } from '@/composables/admin/useAdmin'
import type { BlockInstanceEntity, GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import { listSortedUserTypeBlockInstances } from '@/utils/admin/userTypeBlockInstances'
import type { AnnotationContentRow } from '@/types/admin/annotationContentRow'
import { nilToEmptyString } from '@shared/utils/nilDefaults'
import {
  buildAnnotationContentRowsPayload,
  hydrateAnnotationEditorFromEntity,
} from '@/utils/admin/annotationContentEditorState'

type AnnotationContentRowForm = AnnotationContentRow

export interface UseAnnotationContentEditorProps {
  entity: GlobalEntity<GlobalEntityKey>
  form: FormContext
}

export interface UseAnnotationContentEditorReturn {
  userTypeBlockInstances: ComputedRef<BlockInstanceEntity[]>
  perUserTexts: Ref<Record<string, string>>
  defaultUserTypeInstanceId: Ref<string>
  setPerUserText: (instId: string, text: string) => void
}

export function useAnnotationContentEditor(
  props: UseAnnotationContentEditorProps
): UseAnnotationContentEditorReturn {
  const admin = useAdmin()

  const userTypeBlockInstances = computed(() => listSortedUserTypeBlockInstances(admin))

  const perUserTexts = ref<Record<string, string>>({})
  const defaultUserTypeInstanceId = ref('')

  function syncFormContentRows(): void {
    const next = buildAnnotationContentRowsPayload(
      userTypeBlockInstances.value,
      perUserTexts.value,
      defaultUserTypeInstanceId.value
    )
    const prev = props.form.values.contentRows as AnnotationContentRowForm[] | undefined
    if (JSON.stringify(prev) === JSON.stringify(next)) {
      return
    }
    void props.form.setFieldValue('contentRows', next)
  }

  function applyDefaultTextAndRows(): void {
    if (userTypeBlockInstances.value.length === 0) {
      return
    }
    const defaultId = defaultUserTypeInstanceId.value
    const genericText = nilToEmptyString(perUserTexts.value[defaultId])
    void props.form.setFieldValue('text', genericText)
    syncFormContentRows()
  }

  function hydrateFromEntity(): void {
    const insts = userTypeBlockInstances.value
    const hydrated = hydrateAnnotationEditorFromEntity(
      props.entity as GlobalEntity<'annotationInstance'>,
      insts
    )
    perUserTexts.value = hydrated.perUserTexts
    defaultUserTypeInstanceId.value = hydrated.defaultUserTypeInstanceId
  }

  function setPerUserText(instId: string, text: string): void {
    perUserTexts.value = { ...perUserTexts.value, [instId]: text }
  }

  const userTypeIdsSignature = computed((): string =>
    userTypeBlockInstances.value
      .map((i) => String(i.id))
      .sort()
      .join(',')
  )

  watch(
    [() => props.entity.id, userTypeIdsSignature],
    () => {
      hydrateFromEntity()
    },
    { immediate: true, flush: 'post' }
  )

  watch(
    [defaultUserTypeInstanceId, perUserTexts],
    () => {
      applyDefaultTextAndRows()
    },
    { deep: true, flush: 'post' }
  )

  return {
    userTypeBlockInstances,
    perUserTexts,
    defaultUserTypeInstanceId,
    setPerUserText,
  }
}
