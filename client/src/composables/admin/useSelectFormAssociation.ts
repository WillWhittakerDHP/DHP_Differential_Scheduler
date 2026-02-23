import { nextTick, onMounted, watch, type ComputedRef } from 'vue'
import { patchSelectDomTargets, type SelectDomTarget } from '@/utils/forms/selectDomAssociation'


export interface UseSelectFormAssociationOptions {
  targets: ComputedRef<SelectDomTarget[]>
}

export function useSelectFormAssociation(options: UseSelectFormAssociationOptions): void {
  const { targets } = options

  const run = async (): Promise<void> => {
    await nextTick()
    patchSelectDomTargets(targets.value)
  }

  onMounted(() => {
    void run()
  })

  watch(
    targets,
    () => {
      void run()
    },
    { immediate: true }
  )
}


