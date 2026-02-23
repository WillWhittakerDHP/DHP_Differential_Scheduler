
import { ENTITY_STATUS, FIELD_NAMES } from '@/constants/entityFieldConstants'
import { PrimitiveTypeEnum, PrimitiveModeEnum } from '@/types/entity/formDataEnums'

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

  differentialRole: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Select,
    placeholder: "Differential Role",
    globalField: "differentialRole" as const,
    expandable: false,
    options: [
      { value: null, label: 'None' },
      { value: 'major', label: 'Major' },
      { value: 'minor', label: 'Minor' },
      { value: 'moveable', label: 'Moveable' },
    ],
  },

} as const;
