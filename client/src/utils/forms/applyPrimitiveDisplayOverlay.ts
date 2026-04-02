/**
 * Merges static {@link DisplayFieldConfig} primitive slices (label, tooltip → helpText)
 * into the metadata-derived {@link FieldDisplayConfig} used by entity cards.
 */
import type { FieldDisplayConfig } from '@/composables/fieldContext/types'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { DisplayFieldConfig } from '@/configs/field/display/displayFieldTypes'
import { getAdminConfig } from '@/configs/adminConfig'

function nonEmptyString(value: string | undefined): string {
  const t = value?.trim() ?? ''
  return t
}

export function applyPrimitiveDisplayOverlay<GE extends GlobalEntityKey>(
  entityKey: GE,
  fieldKey: string,
  base: FieldDisplayConfig<GE, GlobalFieldKey<GE>>
): FieldDisplayConfig<GE, GlobalFieldKey<GE>> {
  const row = getAdminConfig().displayFieldConfig[entityKey]?.[fieldKey as GlobalFieldKey<GE>] as
    | DisplayFieldConfig<GE, GlobalFieldKey<GE>>
    | undefined
  const prim = row?.primitiveDisplay
  if (!prim) {
    return base
  }

  const helpFromPrim = nonEmptyString(prim.tooltip)
  const labelFromPrim = nonEmptyString(prim.label)
  const primPh = nonEmptyString(prim.placeholder)

  const baseHelp = base.helpText
  const hasBaseHelp = baseHelp !== undefined && baseHelp !== null && String(baseHelp).trim() !== ''
  const helpText = hasBaseHelp ? baseHelp : helpFromPrim !== '' ? helpFromPrim : base.helpText

  const label = labelFromPrim !== '' && base.label === fieldKey ? labelFromPrim : base.label

  const hasBasePlaceholder = base.placeholder !== undefined && base.placeholder !== ''
  const placeholder = hasBasePlaceholder ? base.placeholder : primPh !== '' ? primPh : base.placeholder

  if (helpText === base.helpText && label === base.label && placeholder === base.placeholder) {
    return base
  }

  return {
    ...base,
    label,
    helpText,
    placeholder,
  }
}
