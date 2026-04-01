/**
 * Pure normalization for select onChange payloads (single vs multi, sentinels).
 * WHY: Keeps useSelectHandlers shallow for function-complexity audit.
 */

import { SELECT_OPTION_GROUP_HEADER_VALUE } from '@/types/selectOptions'

export function normalizeSelectChangeValue(
  value: string | string[] | null | undefined,
  isMultiple: boolean,
  fieldKey: string,
  currentFieldValue: string | string[] | null | undefined
): string | string[] | undefined {
  let normalizedValue: string | string[] | undefined = value ?? undefined

  if (isMultiple) {
    if (value === null || value === undefined) {
      normalizedValue = []
    } else if (Array.isArray(value)) {
      normalizedValue = value
        .map((v) => String(v))
        .filter((v) => v !== '' && v !== SELECT_OPTION_GROUP_HEADER_VALUE)
    } else {
      const currentArray = Array.isArray(currentFieldValue) ? currentFieldValue : []
      const newValueStr = String(value)
      if (newValueStr === SELECT_OPTION_GROUP_HEADER_VALUE) {
        normalizedValue = currentArray
      } else if (currentArray.includes(newValueStr)) {
        normalizedValue = currentArray.filter((v) => v !== newValueStr)
      } else {
        normalizedValue = [...currentArray, newValueStr]
      }
    }
  } else if (value === null || value === undefined || value === '') {
    normalizedValue = undefined
  } else if (Array.isArray(value)) {
    normalizedValue = value.length > 0 ? String(value[0]) : undefined
  } else {
    const stringValue = String(value)
    if (stringValue === '__NULL__' && fieldKey === 'differentialRole') {
      normalizedValue = undefined
    } else {
      normalizedValue = stringValue
    }
  }

  return normalizedValue
}

export function selectValuesAreEqual(
  currentFieldValue: string | string[] | null | undefined,
  normalizedValue: string | string[] | undefined
): boolean {
  const currentArray = Array.isArray(currentFieldValue)
    ? currentFieldValue
    : currentFieldValue
      ? [String(currentFieldValue)]
      : []
  const normalizedArray = Array.isArray(normalizedValue)
    ? normalizedValue
    : normalizedValue
      ? [String(normalizedValue)]
      : []
  const currentSorted = [...currentArray].sort().join(',')
  const normalizedSorted = [...normalizedArray].sort().join(',')
  return currentSorted === normalizedSorted
}
