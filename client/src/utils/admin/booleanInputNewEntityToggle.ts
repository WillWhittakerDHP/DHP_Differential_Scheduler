/**
 * Local (unsaved card) toggles for boolean / ternary fields — mirrors statusButtonTogglePayloads.
 * WHY: Keeps useBooleanInputClick shallow for complexity audit.
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { TernaryBoolean } from '@/types/ternary'
import {
  cycleTernaryBoolean,
  isBooleanLikeAdminValue,
  isTernaryStringValue,
} from '@/utils/admin/statusButtonTogglePayloads'

interface BooleanInputFormLike {
  setFieldValue: (key: string, value: boolean) => void
}

export function applyNewEntityBooleanOrTernaryToggle(params: {
  rawFieldValue: unknown
  fieldKey: GlobalFieldKey<GlobalEntityKey>
  entityKey: GlobalEntityKey
  setValue: (v: boolean | TernaryBoolean) => void
  formInstance: BooleanInputFormLike | null | undefined
}): void {
  const { rawFieldValue, fieldKey: _fieldKey, entityKey: _entityKey, setValue } = params

  if (isTernaryStringValue(rawFieldValue)) {
    setValue(cycleTernaryBoolean(rawFieldValue))
    return
  }

  const normalizedRaw = rawFieldValue === '' ? false : rawFieldValue
  if (!isBooleanLikeAdminValue(normalizedRaw)) {
    return
  }

  const currentValue = normalizedRaw === true
  const newValue = !currentValue
  setValue(newValue)
}
