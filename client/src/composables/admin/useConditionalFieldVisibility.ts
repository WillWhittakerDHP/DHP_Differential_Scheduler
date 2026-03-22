import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type {
  UseConditionalFieldVisibilityOptions,
  UseConditionalFieldVisibilityReturn,
  FieldsByLocation,
} from '@/types/admin/conditionalFieldVisibility'

export function useConditionalFieldVisibility<GE extends GlobalEntityKey = GlobalEntityKey>(
  options: UseConditionalFieldVisibilityOptions<GE>
): UseConditionalFieldVisibilityReturn<GE> {
  const { fieldsByLocation, isComposable, form } = options

  const filteredFieldsByLocation = computed<FieldsByLocation<GE>>(() => {
    const base = fieldsByLocation.value

    const formValues = form.values

    const filteredDirectStacked = base.directStacked.filter((fieldKey) => {
      if (String(fieldKey) === 'composite') {
        return isComposable.value === true
      }
      return true
    })

    const filteredDirectInline = base.directInline.filter((fieldKey) => {
      if (String(fieldKey) === 'composite') {
        return isComposable.value === true
      }
      return true
    })

    const filteredComposition = base.subPanels.composition.filter((fieldKey) => {
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
        composition: filteredComposition,
      },
    }
  })

  return {
    filteredFieldsByLocation,
  }
}
