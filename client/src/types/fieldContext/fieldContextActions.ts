import type { ValidAdminValue } from '@/constants/primitives'

export interface UseFieldContextActionsReturn {
  setFocus: (focused: boolean) => void
  validate: () => Promise<boolean>
  clearError: () => void
  save: () => Promise<void>
  reset: () => void
  getValue: () => ValidAdminValue
  setValue: (value: ValidAdminValue) => void
}
