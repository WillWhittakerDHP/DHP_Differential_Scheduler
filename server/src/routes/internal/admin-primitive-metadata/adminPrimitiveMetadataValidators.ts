/**
 * Admin Primitive Metadata Router Validation Utilities
 * 
 * LEARNING: Extracted validation logic for admin primitive metadata operations
 * WHY: Improves code reusability, testability, and maintainability
 * PATTERN: Pure validation functions that return validation results
 */

import { ValidationResult } from '../../helpers/routerValidators.js'
import { ERROR_MESSAGES, REQUIRED_FIELDS, VALID_ENTITY_TYPES, RENDER_AS_REQUIRING_INPUT_CONFIG } from './adminPrimitiveMetadataConstants.js'

/**
 * Validate entity type
 * LEARNING: Extracted entity type validation logic
 * WHY: Reusable validation for admin primitive metadata operations
 * PATTERN: Check entity type against valid types, return validation result
 * 
 * @param entityType - Entity type to validate
 * @returns ValidationResult indicating if entity type is valid
 */
export function validateEntityType(entityType: unknown): ValidationResult {
  if (typeof entityType !== 'string' || !VALID_ENTITY_TYPES.includes(entityType as (typeof VALID_ENTITY_TYPES)[number])) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_ENTITY_TYPE,
      details: {
        entityType,
        validEntityTypes: VALID_ENTITY_TYPES,
        message: `entityType must be one of: ${VALID_ENTITY_TYPES.join(', ')}`,
      }
    }
  }
  
  return { valid: true }
}

/**
 * Validate required fields for metadata creation/update
 * LEARNING: Extracted required field validation logic
 * WHY: Reusable validation for admin primitive metadata operations
 * PATTERN: Check required fields, return validation result
 * 
 * @param data - Metadata data object
 * @returns ValidationResult indicating if required fields are present
 */
export function validateRequiredFields(data: {
  fieldKey?: unknown
  dataType?: unknown
  label?: unknown
  visibility?: unknown
  layout?: unknown
  displayOrder?: unknown
}): ValidationResult {
  const missingFields: string[] = []
  
  for (const field of REQUIRED_FIELDS.CREATE_UPDATE) {
    if (data[field as keyof typeof data] === undefined || data[field as keyof typeof data] === null) {
      missingFields.push(field)
    }
  }
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      error: ERROR_MESSAGES.MISSING_REQUIRED_FIELDS,
      details: {
        required: REQUIRED_FIELDS.CREATE_UPDATE,
        missing: missingFields,
      }
    }
  }
  
  return { valid: true }
}

/**
 * Validate renderAs value
 * LEARNING: Extracted renderAs validation logic
 * WHY: Reusable validation for admin primitive metadata operations
 * PATTERN: Check renderAs value, return validation result
 * 
 * @param renderAs - RenderAs value to validate
 * @returns ValidationResult indicating if renderAs is valid
 */
export function validateRenderAs(renderAs: unknown): ValidationResult {
  if (renderAs === 'toggle') {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_RENDER_AS,
      details: {
        message: 'renderAs "toggle" is not supported. Use "statusButton" for boolean toggle fields or "text" for regular boolean inputs.',
      }
    }
  }
  
  return { valid: true }
}

/**
 * Validate inputConfig is present when required
 * LEARNING: Extracted inputConfig validation logic
 * WHY: Reusable validation for admin primitive metadata operations
 * PATTERN: Check if renderAs requires inputConfig, validate inputConfig exists
 * 
 * @param renderAs - RenderAs value
 * @param inputConfig - InputConfig value to validate
 * @returns ValidationResult indicating if inputConfig is valid
 */
export function validateInputConfig(renderAs: string, inputConfig: unknown): ValidationResult {
  if (typeof renderAs === 'string' && RENDER_AS_REQUIRING_INPUT_CONFIG.includes(renderAs as (typeof RENDER_AS_REQUIRING_INPUT_CONFIG)[number])) {
    if (!inputConfig || typeof inputConfig !== 'object') {
      return {
        valid: false,
        error: ERROR_MESSAGES.MISSING_INPUT_CONFIG,
        details: {
          message: `inputConfig is required when renderAs is "${renderAs}". Expected FormFieldConfig structure with relationshipSelect or typeSelect property, or direct select config.`,
        }
      }
    }
  }
  
  return { valid: true }
}
