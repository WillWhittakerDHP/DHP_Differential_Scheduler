/**
 * Property Router Validation Utilities
 * 
 * LEARNING: Extracted validation logic for property operations
 * WHY: Improves code reusability, testability, and maintainability
 * PATTERN: Pure validation functions that return validation results
 */

import {
  BLOCK_SHAPE_NAMES,
  ERROR_MESSAGES,
  FOUNDATION_ACCESS_VALUES,
  PATCH_PROPERTY_DETAILS_FIELDS,
  PATCH_PROPERTY_FIELD_KEY,
  PROPERTY_SOURCE_VALUES,
  REQUIRED_FIELDS,
} from './propertyConstants.js'
import { isBlockInstanceWithShape } from './propertyHelpers.js'

/**
 * Validation result type
 * LEARNING: Structured validation result for consistent error handling
 * WHY: Enables type-safe validation results with clear success/failure states
 * PATTERN: Discriminated union type for validation results
 */
export type ValidationResult = 
  | { valid: true }
  | { valid: false; error: string; details?: Record<string, unknown> }

/**
 * Validate required address fields
 * LEARNING: Extracted address field validation logic
 * WHY: Reusable validation for address creation and updates
 * PATTERN: Check required fields, return validation result
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
 * LEARNING: Extracted block shape validation logic
 * WHY: Reusable validation for property type assignment
 * PATTERN: Check block shape name, return validation result
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
 * LEARNING: Extracted bulk block instance validation logic
 * WHY: Reusable validation for bulk property type operations
 * PATTERN: Validate all instances, collect invalid ones, return validation result
 * 
 * @param blockInstances - Array of BlockInstance with block_shape associations
 * @param requestedIds - Array of requested block instance IDs
 * @returns ValidationResult indicating if all block instances are valid
 */
export function validateBlockInstancesForPropertyTypes(
  blockInstances: unknown[],
  requestedIds: string[]
): ValidationResult {
  // Check for invalid block shapes
  const invalidInstances = blockInstances.filter((bi: unknown) => {
    if (!isBlockInstanceWithShape(bi)) return true
    const blockShape = bi.block_shape
    return !blockShape || blockShape.name !== BLOCK_SHAPE_NAMES.PROPERTIES
  })
  
  if (invalidInstances.length > 0) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_BLOCK_SHAPES_BULK,
      details: {
        invalidBlockInstanceIds: invalidInstances.map((bi: unknown) => (bi as { id: string }).id)
      }
    }
  }
  
  // Check for missing block instances
  const foundIds = blockInstances.map((bi: unknown) => (bi as { id: string }).id)
  const missingIds = requestedIds.filter((id) => !foundIds.includes(id))
  
  if (missingIds.length > 0) {
    return {
      valid: false,
      error: ERROR_MESSAGES.BLOCK_INSTANCES_NOT_FOUND,
      details: {
        missingBlockInstanceIds: missingIds
      }
    }
  }
  
  return { valid: true }
}

/**
 * Validate required field for property type operations
 * LEARNING: Extracted property type field validation logic
 * WHY: Reusable validation for property type operations
 * PATTERN: Check required field, return validation result
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

/**
 * Result type for PATCH property details validation
 * LEARNING: Discriminated union for type-safe validated payload
 */
export type PatchPropertyDetailsResult =
  | { valid: true; data: Record<string, unknown> }
  | { valid: false; error: string; details?: Record<string, unknown> }

/**
 * Validate and allowlist PATCH body for property details (mass-assignment safety)
 * LEARNING: Only allowed fields are extracted; enums and types are validated/coerced
 * WHY: Prevents mass-assignment; req.body must not be passed directly to Sequelize update()
 * PATTERN: Allowlist keys, validate enums, coerce numbers, return plain object for update
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

    switch (key) {
      case PATCH_PROPERTY_FIELD_KEY.MLS_NUMBER:
        data.mlsNumber = value === null ? null : typeof value === 'string' ? value : String(value)
        break
      case PATCH_PROPERTY_FIELD_KEY.SQUARE_FOOTAGE:
      case PATCH_PROPERTY_FIELD_KEY.BEDROOMS:
      case PATCH_PROPERTY_FIELD_KEY.ADDITIONAL_UNITS: {
        if (value === null) {
          data[key] = null
        } else {
          const n = Number(value)
          data[key] = Number.isInteger(n) ? n : null
        }
        break
      }
      case PATCH_PROPERTY_FIELD_KEY.BATHROOMS: {
        if (value === null) {
          data.bathrooms = null
        } else {
          const n = Number(value)
          data.bathrooms = Number.isFinite(n) ? n : null
        }
        break
      }
      case PATCH_PROPERTY_FIELD_KEY.FOUNDATION_ACCESS:
        if (value === null) {
          data.foundationAccess = null
        } else if (typeof value === 'string' && (FOUNDATION_ACCESS_VALUES as readonly string[]).includes(value)) {
          data.foundationAccess = value
        } else {
          return {
            valid: false,
            error: ERROR_MESSAGES.INVALID_PATCH_BODY,
            details: { field: key, allowed: [...FOUNDATION_ACCESS_VALUES] }
          }
        }
        break
      case PATCH_PROPERTY_FIELD_KEY.SOURCE:
        if (typeof value === 'string' && (PROPERTY_SOURCE_VALUES as readonly string[]).includes(value)) {
          data.source = value
        } else {
          return {
            valid: false,
            error: ERROR_MESSAGES.INVALID_PATCH_BODY,
            details: { field: key, allowed: [...PROPERTY_SOURCE_VALUES] }
          }
        }
        break
      default:
        data[key] = value
    }
  }

  return { valid: true, data }
}
