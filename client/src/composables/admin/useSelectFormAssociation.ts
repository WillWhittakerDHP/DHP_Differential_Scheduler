import { nextTick, onMounted, watch, type ComputedRef } from 'vue'
import { patchSelectDomTargets, type SelectDomTarget } from '@/utils/forms/selectDomAssociation'

/**
 * useSelectFormAssociation
 *
 * may not forward `name` attributes down to the underlying native <select>.
 *
 * - Forms/validation tools and (unfortunately) browser extensions can depend on correct form-control wiring.
 * - We want DOM work out of SFCs: components should stay as UI shells.
 *
 * - Watch a set of known wrapper IDs (AppSelect assigns id `app-select-${attrs.id}`)
 * - After render (`nextTick`), find the underlying <select> and ensure it has the expected `name`
 * - Patch the nearest <form> using our centralized `patchFormElements` utility
 */

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


