/**
 * Shared factory for metadata tier validators. Consolidates duplicate validation logic
 * from admin-metadata, admin-primitive-metadata, and admin-relationship-metadata.
 */
import {
  validateRequiredFields as validateRequiredFieldsShared,
  type ValidationResult,
} from '../../helpers/routerValidators.js'

export interface MetadataValidatorConfig {
  validEntityTypes: readonly string[]
  requiredFields: readonly string[]
  errorMessages: {
    INVALID_ENTITY_TYPE: string
    MISSING_REQUIRED_FIELDS: string
    INVALID_RENDER_AS?: string
    MISSING_INPUT_CONFIG: string
  }
  renderAsRequiringInputConfig: readonly string[]
  /** Message template for missing inputConfig; may reference "relationshipSelect or typeSelect" or "relationshipSelect" only. */
  missingInputConfigMessage: (renderAs: string) => string
}

/**
 * Create validateEntityType that checks entityType against config.validEntityTypes.
 */
export function createValidateEntityType(config: MetadataValidatorConfig): (entityType: unknown) => ValidationResult {
  const { validEntityTypes, errorMessages } = config
  return function validateEntityType(entityType: unknown): ValidationResult {
    if (typeof entityType !== 'string' || !validEntityTypes.includes(entityType)) {
      return {
        valid: false,
        error: errorMessages.INVALID_ENTITY_TYPE,
        details: {
          entityType,
          validEntityTypes,
          message: `entityType must be one of: ${validEntityTypes.join(', ')}`,
        },
      }
    }
    return { valid: true }
  }
}

/**
 * Create validateRequiredFields that uses shared helper with config.requiredFields and error message.
 */
export function createValidateRequiredFields(config: MetadataValidatorConfig): (data: Record<string, unknown>) => ValidationResult {
  const { requiredFields, errorMessages } = config
  return function validateRequiredFields(data: Record<string, unknown>): ValidationResult {
    return validateRequiredFieldsShared(
      data,
      requiredFields,
      errorMessages.MISSING_REQUIRED_FIELDS
    )
  }
}

/**
 * Create validateRenderAs that rejects "toggle". Optional if config has no INVALID_RENDER_AS.
 */
export function createValidateRenderAs(config: MetadataValidatorConfig): ((renderAs: unknown) => ValidationResult) | null {
  const msg = config.errorMessages.INVALID_RENDER_AS
  if (!msg) return null
  return function validateRenderAs(renderAs: unknown): ValidationResult {
    if (renderAs === 'toggle') {
      return {
        valid: false,
        error: msg,
        details: {
          message: 'renderAs "toggle" is not supported. Use "statusButton" for boolean toggle fields or "text" for regular boolean inputs.',
        },
      }
    }
    return { valid: true }
  }
}

/**
 * Create validateInputConfig that requires inputConfig when renderAs is in config.renderAsRequiringInputConfig.
 */
export function createValidateInputConfig(config: MetadataValidatorConfig): (renderAs: string, inputConfig: unknown) => ValidationResult {
  const { renderAsRequiringInputConfig, errorMessages, missingInputConfigMessage } = config
  return function validateInputConfig(renderAs: string, inputConfig: unknown): ValidationResult {
    if (typeof renderAs === 'string' && renderAsRequiringInputConfig.includes(renderAs)) {
      if (!inputConfig || typeof inputConfig !== 'object') {
        return {
          valid: false,
          error: errorMessages.MISSING_INPUT_CONFIG,
          details: {
            message: missingInputConfigMessage(renderAs),
          },
        }
      }
    }
    return { valid: true }
  }
}

/** Constants shape passed by admin-metadata and admin-primitive-metadata validators. */
export interface MetadataValidatorConstants {
  VALID_ENTITY_TYPES: readonly string[]
  REQUIRED_FIELDS: { CREATE_UPDATE: readonly string[] }
  ERROR_MESSAGES: {
    INVALID_ENTITY_TYPE: string
    MISSING_REQUIRED_FIELDS: string
    INVALID_RENDER_AS?: string
    MISSING_INPUT_CONFIG: string
  }
  RENDER_AS_REQUIRING_INPUT_CONFIG: readonly string[]
}

const MISSING_INPUT_CONFIG_TEMPLATE = (renderAs: string) =>
  `inputConfig is required when renderAs is "${renderAs}". Expected direct select config (targetMode relationship or primitive), or legacy relationshipSelect wrapper until migrated.`

/**
 * Build config and create all four validators from tier constants. Single place for validator wiring
 * so admin-metadata and admin-primitive-metadata do not duplicate config/export blocks.
 */
export function createMetadataValidators(constants: MetadataValidatorConstants) {
  const config: MetadataValidatorConfig = {
    validEntityTypes: constants.VALID_ENTITY_TYPES,
    requiredFields: constants.REQUIRED_FIELDS.CREATE_UPDATE,
    errorMessages: constants.ERROR_MESSAGES,
    renderAsRequiringInputConfig: constants.RENDER_AS_REQUIRING_INPUT_CONFIG,
    missingInputConfigMessage: MISSING_INPUT_CONFIG_TEMPLATE,
  }
  return {
    validateEntityType: createValidateEntityType(config),
    validateRequiredFields: createValidateRequiredFields(config),
    validateRenderAs: createValidateRenderAs(config)!,
    validateInputConfig: createValidateInputConfig(config),
  }
}
