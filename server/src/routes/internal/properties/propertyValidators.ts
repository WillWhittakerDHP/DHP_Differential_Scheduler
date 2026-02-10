/**
 * Property Router Validation Utilities
 * 
 * LEARNING: Extracted validation logic for property operations
 * WHY: Improves code reusability, testability, and maintainability
 * PATTERN: Pure validation functions that return validation results
 */

import { BLOCK_SHAPE_NAMES, ERROR_MESSAGES, REQUIRED_FIELDS } from './propertyConstants.js'

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
    if (!addressData[field as keyof typeof addressData]) {
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
 * Validate block instance has "Properties" block shape
 * LEARNING: Extracted block shape validation logic
 * WHY: Reusable validation for property type assignment
 * PATTERN: Check block shape name, return validation result
 * 
 * @param blockInstance - BlockInstance with block_shape association
 * @param blockInstanceId - Block instance ID for error messages
 * @returns ValidationResult indicating if block shape is valid
 */
export function validateBlockShape(
  blockInstance: any,
  blockInstanceId: string
): ValidationResult {
  const blockShape = (blockInstance as any).block_shape
  
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
  blockInstances: any[],
  requestedIds: string[]
): ValidationResult {
  // Check for invalid block shapes
  const invalidInstances = blockInstances.filter((bi) => {
    const blockShape = (bi as any).block_shape
    return !blockShape || blockShape.name !== BLOCK_SHAPE_NAMES.PROPERTIES
  })
  
  if (invalidInstances.length > 0) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_BLOCK_SHAPES_BULK,
      details: {
        invalidBlockInstanceIds: invalidInstances.map((bi) => bi.id)
      }
    }
  }
  
  // Check for missing block instances
  const foundIds = blockInstances.map((bi) => bi.id)
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
