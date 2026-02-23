/**
 */

import { ENTITY_STATUS, FIELD_NAMES } from '@/constants/entityFieldConstants'
import type { GlobalFieldKey } from '@/constants/primitives'
import { PrimitiveTypeEnum, PrimitiveModeEnum } from '@/types/entity/formDataEnums'
import type { PrimitiveFormField } from '@/types/entity/formFields'
import { baseEntityFields } from './baseEntityFields'

export const partInstancePrimitiveFields = {
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

  active: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: ENTITY_STATUS.ACTIVE,
    globalField: "active",
  },
  
  zeroOutPart: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "Zero Out Part",
    globalField: "zeroOutPart",
  },
  
  
  baseTime: {
    primitiveType: PrimitiveTypeEnum.Number,
    primitiveMode: PrimitiveModeEnum.Number,
    placeholder: "Base Time",
    globalField: "baseTime",
  },
  
  rateOverBaseTime: {
    primitiveType: PrimitiveTypeEnum.Number,
    primitiveMode: PrimitiveModeEnum.Number,
    placeholder: "Rate Over Base Time",
    globalField: "rateOverBaseTime",
  },
  
  baseFee: {
    primitiveType: PrimitiveTypeEnum.Number,
    primitiveMode: PrimitiveModeEnum.Number,
    placeholder: "Base Fee",
    globalField: "baseFee",
  },
  
  rateOverBaseFee: {
    primitiveType: PrimitiveTypeEnum.Number,
    primitiveMode: PrimitiveModeEnum.Number,
    placeholder: "Rate Over Base Fee",
    globalField: "rateOverBaseFee",
  },
} satisfies Partial<Record<GlobalFieldKey<"partInstance">, PrimitiveFormField<"partInstance">>>;

