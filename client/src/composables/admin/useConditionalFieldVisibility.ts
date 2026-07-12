import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type {
  UseConditionalFieldVisibilityOptions,
  UseConditionalFieldVisibilityReturn,
  FieldsByLocation,
} from '@/types/admin/conditionalFieldVisibility'

function showBlockInstanceSemanticTypeField<GE extends GlobalEntityKey>(
  entityKey: GE,
  fieldKey: GlobalFieldKey<GE>,
  options: UseConditionalFieldVisibilityOptions<GE>
): boolean {
  if (String(fieldKey) !== 'semanticType' || entityKey !== 'blockInstance') {
    return true
  }
  const flag = options.isUserSemanticBlockInstance
  if (flag === undefined) {
    return false
  }
  const v = 'value' in flag ? flag.value : flag
  return v === true
}

export function useConditionalFieldVisibility<GE extends GlobalEntityKey = GlobalEntityKey>(
  options: UseConditionalFieldVisibilityOptions<GE>
): UseConditionalFieldVisibilityReturn<GE> {
  const { fieldsByLocation, isComposable, form, entityKey } = options

  const filteredFieldsByLocation = computed<FieldsByLocation<GE>>(() => {
    const base = fieldsByLocation.value

    const formValues = form.values

    const filteredDirectStacked = base.directStacked.filter((fieldKey) => {
      if (String(fieldKey) === 'composite') {
        return isComposable.value === true
      }
      if (!showBlockInstanceSemanticTypeField(entityKey, fieldKey, options)) {
        return false
      }
      return true
    })

    const filteredDirectInline = base.directInline.filter((fieldKey) => {
      if (String(fieldKey) === 'composite') {
        return isComposable.value === true
      }
      if (!showBlockInstanceSemanticTypeField(entityKey, fieldKey, options)) {
        return false
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
