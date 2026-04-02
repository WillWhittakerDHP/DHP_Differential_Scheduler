/**
 * Pure resolution of admin field values from entity records (field context).
 * WHY: Keeps branching out of composables (function-governance).
 */
import type { GlobalEntityKey } from '@/constants/entities'
import type { ValidAdminValue } from '@/constants/primitives'
import { asEmptyString } from '@/utils/safeDefaults'

function missingDefaultForEntityProperty(
  _entityKey: GlobalEntityKey,
  _propertyName: string
): ValidAdminValue {
  return ''
}

function coerceUnknownToValidAdminValue(propValue: unknown): ValidAdminValue {
  if (Array.isArray(propValue)) {
    return propValue as ValidAdminValue
  }
  if (typeof propValue === 'object') {
    return propValue as ValidAdminValue
  }
  if (typeof propValue === 'boolean' || typeof propValue === 'number') {
    return propValue as ValidAdminValue
  }
  if (typeof propValue === 'string') {
    return asEmptyString(propValue) as ValidAdminValue
  }
  return asEmptyString(String(propValue)) as ValidAdminValue
}

/**
 * Reads a property from an entity-shaped record and normalizes to {@link ValidAdminValue}.
 */
export function readValidAdminValueFromEntityRecord(
  entityKey: GlobalEntityKey,
  propertyName: string,
  currentEntity: Record<string, unknown> | undefined
): ValidAdminValue {
  if (!currentEntity) {
    return ''
  }
  if (!Object.prototype.hasOwnProperty.call(currentEntity, propertyName)) {
    return missingDefaultForEntityProperty(entityKey, propertyName)
  }
  const propValue = currentEntity[propertyName]
  if (propValue === null || propValue === undefined) {
    return missingDefaultForEntityProperty(entityKey, propertyName)
  }
  return coerceUnknownToValidAdminValue(propValue)
}
