/**
 * LEARNING: EventInstance Field Definitions
 * WHY: Defines which fields are primitive for EventInstance (configuration data, not entity)
 * PATTERN: Similar to entity field configs but for configuration data
 * NOTE: orderIndex is hidden (managed via drag-and-drop UI, not editable field)
 */

import { PrimitiveTypeEnum, PrimitiveModeEnum } from '../../../../types/entity/formDataEnums'

/**
 * LEARNING: EventInstance Field Definitions (Configuration Data)
 * WHY: Defines field types for EventInstance - used for metadata seed data and type information
 * PATTERN: Similar structure to entity field configs but for configuration data
 * NOTE: These are NOT entities, so they don't use PrimitiveFormField<GlobalEntityKey>
 */
export const eventInstanceFields = {
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
    placeholder: "Enter event instance name",
    globalField: "name" as const,
    expandable: true, // Title field
  },

  eventShapeRef: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Input,
    placeholder: "Select event shape",
    globalField: "eventShapeRef" as const,
    expandable: false,
  },

  titleTemplate: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Textarea,
    placeholder: "Template for event title (e.g., '{service} on {propertyType}')",
    globalField: "titleTemplate" as const,
    expandable: false,
  },

  descriptionTemplate: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Textarea,
    placeholder: "Template for event description (e.g., '{clientName} - {propertyAddress}')",
    globalField: "descriptionTemplate" as const,
    expandable: false,
  },

  locationTemplate: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Textarea,
    placeholder: "Template for event location (e.g., '{propertyAddress}')",
    globalField: "locationTemplate" as const,
    expandable: false,
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
} as const;
