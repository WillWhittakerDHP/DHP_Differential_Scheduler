
import {
  createValidateEntityType,
  createValidateRequiredFields,
  createValidateInputConfig,
} from '../shared/metadataValidatorFactory.js'
import { ERROR_MESSAGES, REQUIRED_FIELDS, VALID_ENTITY_TYPES, RENDER_AS_REQUIRING_INPUT_CONFIG } from './adminRelationshipMetadataConstants.js'

const config = {
  validEntityTypes: VALID_ENTITY_TYPES as readonly string[],
  requiredFields: REQUIRED_FIELDS.CREATE_UPDATE,
  errorMessages: ERROR_MESSAGES,
  renderAsRequiringInputConfig: RENDER_AS_REQUIRING_INPUT_CONFIG as readonly string[],
  missingInputConfigMessage: (renderAs: string) =>
    `inputConfig is required when renderAs is "${renderAs}". Expected direct select config (targetMode relationship or primitive), or legacy relationshipSelect wrapper until migrated.`,
}

export const validateEntityType = createValidateEntityType(config)
export const validateRequiredFields = createValidateRequiredFields(config)
export const validateInputConfig = createValidateInputConfig(config)
