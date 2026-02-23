
import {
  validateRequiredFields as validateRequiredFieldsShared,
  type ValidationResult,
} from '../../helpers/routerValidators.js'
import { ERROR_MESSAGES, REQUIRED_FIELDS, VALID_ENTITY_TYPES, RENDER_AS_REQUIRING_INPUT_CONFIG } from './adminMetadataConstants.js'

/**
 * Validate entity type
 * 
 * @param entityType - Entity type to validate
 * @returns ValidationResult indicating if entity type is valid
 */
export function validateEntityType(entityType: unknown): ValidationResult {
  if (typeof entityType !== 'string' || !(VALID_ENTITY_TYPES as readonly string[]).includes(entityType)) {
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
  return validateRequiredFieldsShared(
    data as Record<string, unknown>,
    REQUIRED_FIELDS.CREATE_UPDATE,
    ERROR_MESSAGES.MISSING_REQUIRED_FIELDS
  )
}

/**
 * Validate renderAs value
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
 * 
 * @param renderAs - RenderAs value
 * @param inputConfig - InputConfig value to validate
 * @returns ValidationResult indicating if inputConfig is valid
 */
export function validateInputConfig(renderAs: string, inputConfig: unknown): ValidationResult {
  if (typeof renderAs === 'string' && (RENDER_AS_REQUIRING_INPUT_CONFIG as readonly string[]).includes(renderAs)) {
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
