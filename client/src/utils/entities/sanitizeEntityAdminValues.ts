import type { GlobalEntityKey } from '@/constants/entities'
import type { ValidAdminValue } from '@/constants/primitives'

type AdminValueRecord = Record<string, ValidAdminValue>

/**
 * Normalize admin form values before sending to the API.
 *
 * LEARNING: Some form fields send empty strings for booleans/numbers.
 * WHY: The backend expects real boolean/number values, not empty strings.
 *
 * NOTE: This intentionally preserves the existing field maps and behavior from `useEntityCrud`.
 */
export function sanitizeEntityAdminValues(
  entityKey: GlobalEntityKey,
  input: AdminValueRecord
): AdminValueRecord {
  const sanitizedEntity: AdminValueRecord = { ...input }

  // Existing boolean field map (copied from legacy `useEntityCrud`)
  const booleanFields: Record<GlobalEntityKey, string[]> = {
    blockShape: ['composable', 'constituable', 'disabled', 'dependent', 'visible'],
    blockInstance: ['visible', 'active', 'dependent', 'disabled'],
    partShape: ['dependent', 'visible'],
    partInstance: ['onSite', 'clientPresent', 'moveable', 'disabled', 'active', 'dependent', 'visible'],
  }

  const booleanFieldNames = booleanFields[entityKey] || []
  for (const fieldName of booleanFieldNames) {
    const value = sanitizedEntity[fieldName]
    if (value === '' || value === null || value === undefined) {
      sanitizedEntity[fieldName] = false
    } else if (typeof value === 'string') {
      sanitizedEntity[fieldName] = value.toLowerCase() === 'true'
    }
  }

  // Existing number field map (copied from legacy `useEntityCrud`)
  const numberFields: Record<GlobalEntityKey, string[]> = {
    blockShape: [],
    blockInstance: ['baseSqFt'],
    partShape: [],
    partInstance: ['baseFee', 'rateOverBaseFee', 'baseTime', 'rateOverBaseTime'],
  }

  const numberFieldNames = numberFields[entityKey] || []
  for (const fieldName of numberFieldNames) {
    const value = sanitizedEntity[fieldName]
    if (value === '' || value === null || value === undefined) {
      sanitizedEntity[fieldName] = 0
    } else if (typeof value === 'string') {
      const parsed = parseFloat(value)
      sanitizedEntity[fieldName] = isNaN(parsed) ? 0 : parsed
    }
  }

  return sanitizedEntity
}


