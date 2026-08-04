/**
 * Pure normalization for select onChange payloads (single vs multi, sentinels).
 * WHY: Keeps useSelectHandlers shallow for function-complexity audit.
 */

import { SELECT_OPTION_GROUP_HEADER_VALUE } from '@/types/selectOptions'

function normalizeMultipleSelectChange(
  value: string | string[] | null | undefined,
  currentFieldValue: string | string[] | null | undefined
): string[] {
  if (value === null || value === undefined) {
    return []
  }
  if (Array.isArray(value)) {
    return value
      .map((v) => String(v))
      .filter((v) => v !== '' && v !== SELECT_OPTION_GROUP_HEADER_VALUE)
  }

  const currentArray = Array.isArray(currentFieldValue) ? currentFieldValue : []
  const newValueStr = String(value)
  if (newValueStr === SELECT_OPTION_GROUP_HEADER_VALUE) {
    return currentArray
  }
  return currentArray.includes(newValueStr)
    ? currentArray.filter((v) => v !== newValueStr)
    : [...currentArray, newValueStr]
}

function isNullableSentinelValue(value: string, fieldKey: string): boolean {
  return value === '__NULL__' && (fieldKey === 'anchorEdge' || fieldKey === 'semanticType')
}

function normalizeSingleSelectChange(
  value: string | string[] | null | undefined,
  fieldKey: string
): string | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? String(value[0]) : undefined
  }

  const stringValue = String(value)
  return isNullableSentinelValue(stringValue, fieldKey) ? undefined : stringValue
}

export function normalizeSelectChangeValue(
  value: string | string[] | null | undefined,
  isMultiple: boolean,
  fieldKey: string,
  currentFieldValue: string | string[] | null | undefined
): string | string[] | undefined {
  if (isMultiple) {
    return normalizeMultipleSelectChange(value, currentFieldValue)
  }
  return normalizeSingleSelectChange(value, fieldKey)
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
