/**
 * LEARNING: AnnotationInstance Field Definitions
 * WHY: Defines which fields are primitive for AnnotationInstance (configuration data, not entity)
 * PATTERN: Similar to entity field configs but for configuration data
 * NOTE: orderIndex is hidden (managed via drag-and-drop UI, not editable field)
 */

import { PrimitiveTypeEnum, PrimitiveModeEnum } from '../../../../types/entity/formDataEnums'

export const annotationInstanceFields = {
  id: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Input,
    placeholder: "This Field Should Be Hidden",
    globalField: "id" as const,
    expandable: false,
  },

  text: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.TextArea,
    placeholder: "Enter annotation text",
    globalField: "text" as const,
    expandable: false,
  },

  type: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Input,
    placeholder: "Select annotation shape",
    globalField: "type" as const,
    expandable: false,
  },

  userTypeBlock: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Input,
    placeholder: "Select user type block (or leave empty for generic)",
    globalField: "userTypeBlock" as const,
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
