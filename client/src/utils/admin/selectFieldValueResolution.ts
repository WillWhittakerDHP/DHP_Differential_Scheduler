import { isSelectOptionGroupHeader, SELECT_OPTION_GROUP_HEADER_VALUE, type SelectOptionOrHeader } from '@/types/selectOptions'
import { isDevModeEnabled } from '@/utils/env/devMode'

export function collectSelectableOptionValues(options: SelectOptionOrHeader[]): Set<string> {
  return new Set(
    options.flatMap((opt) => {
      if (isSelectOptionGroupHeader(opt)) return []
      if (opt.children && Array.isArray(opt.children)) {
        return opt.children.map((child) => String(child.value))
      }
      return [String(opt.value)]
    })
  )
}

function normalizeMultipleSelectFieldValue(
  value: unknown,
  optionValues: Set<string>
): string[] {
  if (Array.isArray(value)) {
    const normalized = value
      .map((v) => String(v))
      .filter((v) => v !== '' && v !== SELECT_OPTION_GROUP_HEADER_VALUE)
    return normalized.filter((v) => optionValues.has(v))
  }
  if (value === null || value === undefined || value === '') {
    return []
  }
  const stringValue = String(value)
  return optionValues.has(stringValue) ? [stringValue] : []
}

/** Multiple-select branch for useSelectFieldValue (keeps composable nesting ≤3). */
export function resolveMultipleSelectComputedValue(value: unknown, optionValues: Set<string>): string[] {
  const validValues = normalizeMultipleSelectFieldValue(value, optionValues)
  if (!isDevModeEnabled() || !Array.isArray(value)) {
    return validValues
  }
  const normalized = value
    .map((v) => String(v))
    .filter((v) => v !== '' && v !== SELECT_OPTION_GROUP_HEADER_VALUE)
  if (normalized.length !== validValues.length) {
    void 0
  }
  return validValues
}

export function normalizeSingleSelectFieldValue(
  value: unknown,
  optionValues: Set<string>,
  fieldKey: string
): string | null {
  if (value === null || value === undefined || value === '') {
    if (value === null && fieldKey === 'ternaryDefault') {
      return '__NULL__'
    }
    return null
  }
  const stringValue = String(value)
  if (stringValue === '__NULL__' && fieldKey === 'ternaryDefault') {
    return '__NULL__'
  }
  return optionValues.has(stringValue) ? stringValue : null
}
