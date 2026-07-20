import { computed } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type {
  UseConditionalFieldVisibilityOptions,
  UseConditionalFieldVisibilityReturn,
  FieldsByLocation,
} from '@/types/admin/conditionalFieldVisibility'
import { shouldShowEntityField } from '@/utils/admin/blockInstanceFieldVisibility'
import { isAtomicAccumulatorServiceForm } from '@/utils/admin/accumulatorFieldVisibility'

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

/**
 * WHY: Accumulator lives on atomic services only; links appear when Accumulator is on.
 * PATTERN: Same gate for direct fields and the Relationships subpanel (field lives there).
 */
function shouldShowAccumulatorScopedField<GE extends GlobalEntityKey>(
  fieldKey: GlobalFieldKey<GE>,
  options: UseConditionalFieldVisibilityOptions<GE>
): boolean | null {
  const key = String(fieldKey)
  if (key !== 'accumulator' && key !== 'accumulationLinks') {
    return null
  }
  if (
    !isAtomicAccumulatorServiceForm({
      semanticType: resolveBlockInstanceSemanticType(options),
      composite: options.form.values.composite,
    })
  ) {
    return false
  }
  if (key === 'accumulationLinks') {
    return options.form.values.accumulator === true && showFieldForEntity(options.entityKey, fieldKey, options)
  }
  return showFieldForEntity(options.entityKey, fieldKey, options)
}

function filterFieldsForEntity<GE extends GlobalEntityKey>(
  fields: GlobalFieldKey<GE>[],
  options: UseConditionalFieldVisibilityOptions<GE>
): GlobalFieldKey<GE>[] {
  return fields.filter((fieldKey) => {
    const accumulatorGate = shouldShowAccumulatorScopedField(fieldKey, options)
    if (accumulatorGate !== null) {
      return accumulatorGate
    }
    return showFieldForEntity(options.entityKey, fieldKey, options)
  })
}

function shouldShowDirectField<GE extends GlobalEntityKey>(
  fieldKey: GlobalFieldKey<GE>,
  options: UseConditionalFieldVisibilityOptions<GE>
): boolean {
  const accumulatorGate = shouldShowAccumulatorScopedField(fieldKey, options)
  if (accumulatorGate !== null) {
    return accumulatorGate
  }
  return showFieldForEntity(options.entityKey, fieldKey, options)
}

function shouldShowTitleRowField<GE extends GlobalEntityKey>(
  fieldKey: GlobalFieldKey<GE>,
  options: UseConditionalFieldVisibilityOptions<GE>
): boolean {
  const accumulatorGate = shouldShowAccumulatorScopedField(fieldKey, options)
  if (accumulatorGate !== null) {
    return accumulatorGate
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
  // PATTERN: Vertical packaging UI appears when the form says Composite is on.
  return (
    options.form.values.composite === true &&
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
