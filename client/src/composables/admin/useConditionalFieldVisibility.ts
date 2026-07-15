import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type {
  UseConditionalFieldVisibilityOptions,
  UseConditionalFieldVisibilityReturn,
  FieldsByLocation,
} from '@/types/admin/conditionalFieldVisibility'
import { shouldShowEntityField } from '@/utils/admin/blockInstanceFieldVisibility'

function resolveBlockInstanceSemanticType<GE extends GlobalEntityKey>(
  options: UseConditionalFieldVisibilityOptions<GE>
) {
  const flag = options.blockInstanceSemanticType
  if (flag === undefined) {
    return null
  }
  return 'value' in flag ? flag.value : flag
}

function showFieldForEntity<GE extends GlobalEntityKey>(
  entityKey: GE,
  fieldKey: GlobalFieldKey<GE>,
  options: UseConditionalFieldVisibilityOptions<GE>
): boolean {
  return shouldShowEntityField(
    entityKey,
    fieldKey,
    resolveBlockInstanceSemanticType(options)
  )
}

function filterFieldsForEntity<GE extends GlobalEntityKey>(
  fields: GlobalFieldKey<GE>[],
  options: UseConditionalFieldVisibilityOptions<GE>
): GlobalFieldKey<GE>[] {
  return fields.filter((fieldKey) => showFieldForEntity(options.entityKey, fieldKey, options))
}

function shouldShowDirectField<GE extends GlobalEntityKey>(
  fieldKey: GlobalFieldKey<GE>,
  options: UseConditionalFieldVisibilityOptions<GE>
): boolean {
  if (String(fieldKey) === 'composite') {
    return options.isComposable.value === true
  }
  if (String(fieldKey) === 'accumulationLinks') {
    return options.form.values.accumulator === true
  }
  return showFieldForEntity(options.entityKey, fieldKey, options)
}

function shouldShowTitleRowField<GE extends GlobalEntityKey>(
  fieldKey: GlobalFieldKey<GE>,
  options: UseConditionalFieldVisibilityOptions<GE>
): boolean {
  if (String(fieldKey) === 'composite') {
    return options.isComposable.value === true
  }
  return showFieldForEntity(options.entityKey, fieldKey, options)
}

function shouldShowCompositionField<GE extends GlobalEntityKey>(
  fieldKey: GlobalFieldKey<GE>,
  options: UseConditionalFieldVisibilityOptions<GE>
): boolean {
  if (String(fieldKey) !== 'instanceComponents') {
    return showFieldForEntity(options.entityKey, fieldKey, options)
  }
  return (
    options.form.values.composite === true &&
    options.isComposable.value === true &&
    showFieldForEntity(options.entityKey, fieldKey, options)
  )
}

export function useConditionalFieldVisibility<GE extends GlobalEntityKey = GlobalEntityKey>(
  options: UseConditionalFieldVisibilityOptions<GE>
): UseConditionalFieldVisibilityReturn<GE> {
  const { fieldsByLocation } = options

  const filteredFieldsByLocation = computed<FieldsByLocation<GE>>(() => {
    const base = fieldsByLocation.value

    const filteredDirectStacked = base.directStacked.filter((fieldKey) => shouldShowDirectField(fieldKey, options))
    const filteredDirectInline = base.directInline.filter((fieldKey) => shouldShowDirectField(fieldKey, options))
    const filteredTitleRow = base.titleRow.filter((fieldKey) => shouldShowTitleRowField(fieldKey, options))
    const filteredComposition = base.subPanels.composition.filter((fieldKey) =>
      shouldShowCompositionField(fieldKey, options)
    )

    return {
      ...base,
      titleRow: filteredTitleRow,
      directInline: filteredDirectInline,
      directStacked: filteredDirectStacked,
      subPanels: {
        ...base.subPanels,
        parts: filterFieldsForEntity(base.subPanels.parts, options),
        relationships: filterFieldsForEntity(base.subPanels.relationships, options),
        events: filterFieldsForEntity(base.subPanels.events, options),
        composition: filteredComposition,
      },
    }
  })

  return {
    filteredFieldsByLocation,
  }
}
