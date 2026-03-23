
import {
  BLOCK_SHAPE_NAMES,
  ERROR_MESSAGES,
  PATCH_PROPERTY_DETAILS_FIELDS,
  REQUIRED_FIELDS,
} from './propertyConstants.js'
import { isBlockInstanceWithShape } from './propertyHelpers.js'
import { coercePatchPropertyField } from '../../../utils/propertyDetailsPatchCoercion.js'

export type ValidationResult = 
  | { valid: true }
  | { valid: false; error: string; details?: Record<string, unknown> }

/**
 * Validate required address fields
 * 
 * @param addressData - Address data object
 * @returns ValidationResult indicating if address fields are valid
 */
export function validateAddressFields(addressData: {
  address?: unknown
  city?: unknown
  state?: unknown
  zipCode?: unknown
}): ValidationResult {
  const missingFields: string[] = []
  
  for (const field of REQUIRED_FIELDS.ADDRESS) {
    if (!(addressData as Record<string, unknown>)[field]) {
      missingFields.push(field)
    }
  }
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
      details: {
        required: REQUIRED_FIELDS.ADDRESS
      }
    }
  }
  
  return { valid: true }
}

/**
 * Validate block instance has Properties block shape (BLOCK_SHAPE_NAMES.PROPERTIES)
 * 
 * @param blockInstance - BlockInstance with block_shape association
 * @param blockInstanceId - Block instance ID for error messages
 * @returns ValidationResult indicating if block shape is valid
 */
export function validateBlockShape(
  blockInstance: unknown,
  blockInstanceId: string
): ValidationResult {
  if (!isBlockInstanceWithShape(blockInstance)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_BLOCK_SHAPE,
      details: { blockInstanceId, actualBlockShape: 'NULL' },
    }
  }
  const blockShape = blockInstance.block_shape

  if (!blockShape || blockShape.name !== BLOCK_SHAPE_NAMES.PROPERTIES) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_BLOCK_SHAPE,
      details: {
        blockInstanceId,
        actualBlockShape: blockShape?.name || 'NULL'
      }
    }
  }
  
  return { valid: true }
}

/**
 * Validate multiple block instances for bulk operations
 * 
 * @param blockInstances - Array of BlockInstance with block_shape associations
 * @param requestedIds - Array of requested block instance IDs
 * @returns ValidationResult indicating if all block instances are valid
 */
function collectInvalidPropertyShapeIds(blockInstances: unknown[]): string[] {
  return blockInstances
    .filter((bi: unknown) => {
      if (!isBlockInstanceWithShape(bi)) return true
      const blockShape = bi.block_shape
      return !blockShape || blockShape.name !== BLOCK_SHAPE_NAMES.PROPERTIES
    })
    .map((bi: unknown) => (bi as { id: string }).id)
}

function collectMissingRequestedBlockIds(blockInstances: unknown[], requestedIds: string[]): string[] {
  const foundIds = blockInstances.map((bi: unknown) => (bi as { id: string }).id)
  return requestedIds.filter((id) => !foundIds.includes(id))
}

export function validateBlockInstancesForPropertyTypes(
  blockInstances: unknown[],
  requestedIds: string[]
): ValidationResult {
  const invalidIds = collectInvalidPropertyShapeIds(blockInstances)
  const missingIds =
    invalidIds.length === 0 ? collectMissingRequestedBlockIds(blockInstances, requestedIds) : []

  let result: ValidationResult = { valid: true }
  if (invalidIds.length > 0) {
    result = {
      valid: false,
      error: ERROR_MESSAGES.INVALID_BLOCK_SHAPES_BULK,
      details: { invalidBlockInstanceIds: invalidIds },
    }
  } else if (missingIds.length > 0) {
    result = {
      valid: false,
      error: ERROR_MESSAGES.BLOCK_INSTANCES_NOT_FOUND,
      details: { missingBlockInstanceIds: missingIds },
    }
  }
  return result
}

/**
 * Validate required field for property type operations
 * 
 * @param fieldValue - Value to validate
 * @param fieldName - Name of the field being validated
 * @returns ValidationResult indicating if field is valid
 */
export function validateRequiredField(
  fieldValue: unknown,
  fieldName: string
): ValidationResult {
  if (!fieldValue) {
    return {
      valid: false,
      error: `Missing required field: ${fieldName}`
    }
  }
  
  return { valid: true }
}

type PatchPropertyDetailsResult =
  | { valid: true; data: Record<string, unknown> }
  | { valid: false; error: string; details?: Record<string, unknown> }

/**
 * Validate and allowlist PATCH body for property details (mass-assignment safety)
 *
 * @param body - Raw request body (unknown)
 * @returns PatchPropertyDetailsResult with validated data or error
 */
export function validatePropertyDetailsPatchBody(body: unknown): PatchPropertyDetailsResult {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_PATCH_BODY,
      details: { reason: 'Body must be a plain object' }
    }
  }

  const raw = body as Record<string, unknown>
  const data: Record<string, unknown> = {}

  for (const key of PATCH_PROPERTY_DETAILS_FIELDS) {
    const value = raw[key]
    if (value === undefined) continue

    const coerced = coercePatchPropertyField(key, value)
    if (!coerced.ok) {
      return { valid: false, error: coerced.error, details: coerced.details }
    }
    Object.assign(data, coerced.patch)
  }

  return { valid: true, data }
}
