
import { ENTITY_STATUS, FIELD_NAMES } from '@/constants/entityFieldConstants'
import type { GlobalFieldKey } from '@/constants/primitives'
import { PrimitiveTypeEnum, PrimitiveModeEnum } from '@/types/entity/formDataEnums'
import type { PrimitiveFormField } from '@/types/entity/formFields'
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
    globalField: FIELD_NAMES.ORDER_INDEX,
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
    placeholder: ENTITY_STATUS.ACTIVE,
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

  agentPermissions: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "Agent Permissions",
    globalField: FIELD_NAMES.AGENT_PERMISSIONS,
    expandable: false,
  },

  preClosing: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "Pre-closing",
    globalField: "preClosing" as const,
    expandable: false,
  },

  bookingMode: {
    primitiveType: PrimitiveTypeEnum.Boolean,
    primitiveMode: PrimitiveModeEnum.Toggle,
    placeholder: "Booking mode",
    globalField: FIELD_NAMES.BOOKING_MODE,
    expandable: false,
  },
} satisfies Partial<Record<GlobalFieldKey<"blockInstance">, PrimitiveFormField<"blockInstance">>>;

