/**
 * LEARNING: BlockShape Primitive Fields - Field definitions for blockShape entity
 * WHY: Defines which fields are primitive (text, number, boolean) for blockShape
 * PATTERN: Spreads baseEntityFields and adds entity-specific fields
 */

import type { GlobalFieldKey } from '../../../../constants/primitives'
import { PrimitiveTypeEnum, PrimitiveModeEnum } from '../../../../types/entity/formDataEnums'
import type { PrimitiveFormField } from '../../../../types/entity/formFields'
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
    globalField: "orderIndex",
  },
  
  composable: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "Composable",
    globalField: "composable",
  },
  
  constituable: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "State Control",
    globalField: "constituable",
  },
  
  type: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Select,
    placeholder: "Select block shape type",
    globalField: "type",
  },
} satisfies Partial<Record<GlobalFieldKey<"blockShape">, PrimitiveFormField<"blockShape">>>;

