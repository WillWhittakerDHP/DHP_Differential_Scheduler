
import { ENTITY_STATUS, FIELD_NAMES } from '@/constants/entityFieldConstants'
import { PrimitiveTypeEnum, PrimitiveModeEnum } from '@/types/entity/formDataEnums'

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

  uiSlot: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Select,
    placeholder: 'Wizard UI slot (optional)',
    globalField: 'uiSlot' as const,
    expandable: false,
  },
} as const;
