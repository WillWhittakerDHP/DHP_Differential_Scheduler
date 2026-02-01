/**
 * LEARNING: EventShape Field Definitions
 * WHY: Defines which fields are primitive for EventShape (configuration data, not entity)
 * PATTERN: Similar to entity field configs but for configuration data
 * NOTE: orderIndex is hidden (managed via drag-and-drop UI, not editable field)
 */

import { PrimitiveTypeEnum, PrimitiveModeEnum } from '../../../../types/entity/formDataEnums'

/**
 * LEARNING: EventShape Field Definitions (Configuration Data)
 * WHY: Defines field types for EventShape - used for metadata seed data and type information
 * PATTERN: Similar structure to entity field configs but for configuration data
 * NOTE: These are NOT entities, so they don't use PrimitiveFormField<GlobalEntityKey>
 */
export const eventShapeFields = {
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
    placeholder: "Enter event shape name",
    globalField: "name" as const,
    expandable: true, // Title field
  },

  orderIndex: {
    primitiveType: PrimitiveTypeEnum.Number,
    primitiveMode: PrimitiveModeEnum.Hidden,
    placeholder: "This Field Should Be Hidden",
    globalField: "orderIndex" as const,
    expandable: false,
  },

  active: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "Active",
    globalField: "active" as const,
    expandable: false,
  },

  isTernary: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "Is Ternary",
    globalField: "isTernary" as const,
    expandable: false,
  },

  ternaryDefault: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Select,
    placeholder: "Ternary Default",
    globalField: "ternaryDefault" as const,
    expandable: false,
    options: [
      { value: null, label: 'None (Fail Gracefully)' },
      { value: 'true', label: 'True' },
      { value: 'false', label: 'False' },
      { value: 'override', label: 'Override' },
    ],
  },

} as const;
