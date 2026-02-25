import { nextTick, onMounted, watch } from 'vue'
import { patchSelectDomTargets } from '@/utils/forms/selectDomAssociation'
import type { UseSelectFormAssociationOptions } from '@/types/admin/selectFormAssociation'

export type { UseSelectFormAssociationOptions } from '@/types/admin/selectFormAssociation'

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


