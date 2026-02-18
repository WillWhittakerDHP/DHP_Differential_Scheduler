/**
 * LEARNING: AnnotationShape Field Definitions
 * WHY: Defines which fields are primitive for AnnotationShape (configuration data, not entity)
 * PATTERN: Similar to entity field configs but for configuration data
 * NOTE: orderIndex is hidden (managed via drag-and-drop UI, not editable field)
 */

import { ENTITY_STATUS, FIELD_NAMES } from '@/constants/entityFieldConstants'
import { PrimitiveTypeEnum, PrimitiveModeEnum } from '@/types/entity/formDataEnums'

/**
 * LEARNING: AnnotationShape Field Definitions (Configuration Data)
 * WHY: Defines field types for AnnotationShape - used for metadata seed data and type information
 * PATTERN: Similar structure to entity field configs but for configuration data
 * NOTE: These are NOT entities, so they don't use PrimitiveFormField<GlobalEntityKey>
 */
export const annotationShapeFields = {
  id: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Input,
    placeholder: "This Field Should Be Hidden",
    globalField: "id" as const,
    expandable: false,
  },

  name: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Input,
    placeholder: "Enter annotation shape name",
    globalField: "name" as const,
    expandable: true, // Title field
  },

  orderIndex: {
    primitiveType: PrimitiveTypeEnum.Number,
    primitiveMode: PrimitiveModeEnum.Hidden,
    placeholder: "This Field Should Be Hidden",
    globalField: FIELD_NAMES.ORDER_INDEX,
    expandable: false,
  },

  active: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: ENTITY_STATUS.ACTIVE,
    globalField: "active" as const,
    expandable: false,
  },
} as const;
