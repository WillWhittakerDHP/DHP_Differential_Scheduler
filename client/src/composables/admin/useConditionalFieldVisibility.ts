import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { SubPanelRecord } from '@/constants/fieldMetadata'
import type { FormContext } from 'vee-validate'

export interface FieldsByLocation {
  titleRow: GlobalFieldKey<GlobalEntityKey>[]
  directInline: GlobalFieldKey<GlobalEntityKey>[]
  directStacked: GlobalFieldKey<GlobalEntityKey>[]
  subPanels: SubPanelRecord<GlobalFieldKey<GlobalEntityKey>[]>
  hidden: GlobalFieldKey<GlobalEntityKey>[]
}

export interface UseConditionalFieldVisibilityOptions {
  fieldsByLocation: ComputedRef<FieldsByLocation>
  entityKey: GlobalEntityKey
  isComposable: ComputedRef<boolean>
  form: FormContext
}

export interface UseConditionalFieldVisibilityReturn {
  filteredFieldsByLocation: ComputedRef<FieldsByLocation>
}

/**
 * WHY: Some fields should only show under certain conditions (e.g., composite when composable=true)
 */
export function useConditionalFieldVisibility(
  options: UseConditionalFieldVisibilityOptions
): UseConditionalFieldVisibilityReturn {
  const { fieldsByLocation, isComposable, form } = options

  const filteredFieldsByLocation = computed<FieldsByLocation>(() => {
    const base = fieldsByLocation.value
    
    const formValues = form.values
    
    const filteredDirectStacked = base.directStacked.filter(fieldKey => {
      if (String(fieldKey) === 'composite') {
        return isComposable.value === true
      }
      return true
    })
    
    const filteredDirectInline = base.directInline.filter(fieldKey => {
      if (String(fieldKey) === 'composite') {
        return isComposable.value === true
      }
      return true
    })
    
    const filteredComposition = base.subPanels.composition.filter(fieldKey => {
      if (String(fieldKey) === 'instanceComponents') {
        const compositeValue = formValues.composite === true
        return compositeValue && isComposable.value === true
      }
      return true
    })

    return {
      ...base,
      directInline: filteredDirectInline,
      directStacked: filteredDirectStacked,
      subPanels: {
        ...base.subPanels,
        composition: filteredComposition
      }
    }
  })

  return {
    filteredFieldsByLocation,
  }
}
