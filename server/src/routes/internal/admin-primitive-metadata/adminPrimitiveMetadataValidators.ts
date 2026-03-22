
import { createMetadataValidators } from '../shared/metadataValidatorFactory.js'
import { ERROR_MESSAGES, REQUIRED_FIELDS, VALID_ENTITY_TYPES, RENDER_AS_REQUIRING_INPUT_CONFIG } from './adminPrimitiveMetadataConstants.js'

const validators = createMetadataValidators({
  VALID_ENTITY_TYPES,
  REQUIRED_FIELDS,
  ERROR_MESSAGES,
  RENDER_AS_REQUIRING_INPUT_CONFIG,
})

export const validateEntityType = validators.validateEntityType
export const validateRequiredFields = validators.validateRequiredFields
export const validateRenderAs = validators.validateRenderAs
export const validateInputConfig = validators.validateInputConfig
