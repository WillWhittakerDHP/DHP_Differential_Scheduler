/**
 * LEARNING: BlockInstance Primitive Fields - Field definitions for blockInstance entity
 * WHY: Defines which fields are primitive (text, number, boolean) for blockInstance
 * PATTERN: Spreads baseEntityFields and adds entity-specific fields
 */

import type { GlobalFieldKey } from '../../../../constants/primitives'
import { PrimitiveTypeEnum, PrimitiveModeEnum } from '../../../../types/entity/formDataEnums'
import type { PrimitiveFormField } from '../../../../types/entity/formFields'
import { baseEntityFields } from './baseEntityFields'

export const blockInstancePrimitiveFields = {
  ...baseEntityFields,

  name: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Input,
    placeholder: "Enter name",
    globalField: "name" as const,
    expandable: true, // ✅ Title fields are expandable
  },

  orderIndex: {
    primitiveType: PrimitiveTypeEnum.Number,
    primitiveMode: PrimitiveModeEnum.Input,
    placeholder: "This Field Should Be Hidden",
    globalField: "orderIndex" as const,
    expandable: false,
  },

  baseSqFt: {
    primitiveType: PrimitiveTypeEnum.Number,
    primitiveMode: PrimitiveModeEnum.Number,
    placeholder: "Enter a Base Sq Ft",
    globalField: "baseSqFt" as const,
    expandable: false,
  },
  
  active: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "Active",
    globalField: "active" as const,
    expandable: false,
  },
  
  composite: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "Composite",
    globalField: "composite" as const,
    expandable: false,
  },
  
  icon: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Input,
    placeholder: "Select an icon",
    globalField: "icon" as const,
    expandable: false,
  },
  
  allowMultiple: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Checkbox,
    placeholder: "Allow Multiple",
    globalField: "allowMultiple" as const,
    expandable: false,
  },

  requiresUnitNumber: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Checkbox,
    placeholder: "Requires Unit Number",
    globalField: "requiresUnitNumber" as const,
    expandable: false,
  },

  differential: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "Differential",
    globalField: "differential" as const,
    expandable: false,
  },

  bookingMode: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Select,
    placeholder: "Select booking mode",
    globalField: "bookingMode" as const,
    expandable: false,
    options: [
      { value: 'standalone', label: 'Standalone Only' },
      { value: 'addOn', label: 'Add-On Only' },
      { value: 'both', label: 'Standalone or Add-On' },
    ],
  },
} satisfies Partial<Record<GlobalFieldKey<"blockInstance">, PrimitiveFormField<"blockInstance">>>;

