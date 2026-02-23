
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import type { GlobalFieldKey } from '@/constants/primitives'
import { PrimitiveTypeEnum, PrimitiveModeEnum } from '@/types/entity/formDataEnums'
import type { PrimitiveFormField } from '@/types/entity/formFields'
import { baseEntityFields } from './baseEntityFields'

export const blockShapePrimitiveFields = {
  ...baseEntityFields,  
  
  name: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Input,
    placeholder: "Enter name",
    globalField: "name",
    expandable: true, // ✅ Title fields are expandable
  },

  orderIndex: {
    primitiveType: PrimitiveTypeEnum.Number,
    primitiveMode: PrimitiveModeEnum.Hidden,
    placeholder: "This Field Should Be Hidden",
    globalField: FIELD_NAMES.ORDER_INDEX,
  },
  
  composable: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "Composable",
    globalField: "composable",
  },
  
  canHaveParts: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "Can Have Parts",
    globalField: "canHaveParts",
  },
  
  isStateControl: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "State Control",
    globalField: "isStateControl",
  },
  
  type: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Select,
    placeholder: "Select block shape type",
    globalField: "type",
  },
} satisfies Partial<Record<GlobalFieldKey<"blockShape">, PrimitiveFormField<"blockShape">>>;

