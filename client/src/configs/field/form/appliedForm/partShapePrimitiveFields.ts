/**
 * LEARNING: PartShape Primitive Fields - Field definitions for partShape entity
 * WHY: Defines which fields are primitive (text, number, boolean) for partShape
 * PATTERN: Spreads baseEntityFields and adds entity-specific fields
 */

import type { GlobalFieldKey } from '../../../../constants/primitives'
import { PrimitiveTypeEnum, PrimitiveModeEnum } from '../../../../types/entity/formDataEnums'
import type { PrimitiveFormField } from '../../../../types/entity/formFields'
import { baseEntityFields } from './baseEntityFields'

export const partShapePrimitiveFields = {
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

} satisfies Partial<Record<GlobalFieldKey<"partShape">, PrimitiveFormField<"partShape">>>;

