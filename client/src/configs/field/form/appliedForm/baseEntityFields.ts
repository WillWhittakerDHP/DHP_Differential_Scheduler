
import type { GlobalEntityKey } from '@/constants/entities'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import type { GlobalFieldKey } from '@/constants/primitives'
import { PrimitiveTypeEnum, PrimitiveModeEnum } from '@/types/entity/formDataEnums'
import type { PrimitiveFormField } from '@/types/entity/formFields'

export const baseEntityFields = {
  id: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Input,
    placeholder: "This Field Should Be Hidden",
    globalField: "id" as const,
    expandable: false,
  },

  entityKey: {
    primitiveType: PrimitiveTypeEnum.String,
    primitiveMode: PrimitiveModeEnum.Input,
    placeholder: "This Field Should Be Hidden",
    globalField: FIELD_NAMES.ENTITY_KEY,
    expandable: false,
  },
} satisfies Partial<Record<GlobalFieldKey<GlobalEntityKey>, PrimitiveFormField<GlobalEntityKey>>>;

