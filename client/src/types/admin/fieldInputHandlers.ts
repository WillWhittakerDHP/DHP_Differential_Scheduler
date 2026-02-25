import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextType } from '@/composables/fieldContext/types'
import type { EntityCardSaveContext } from '@/components/admin/generic/entityCardConstants'
import type { FieldKeyboardGuardType } from '@/utils/admin/fieldKeyboardGuard'

export interface UseFieldInputHandlersParams {
  fieldContext: FieldContextType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  disableAutoSave?: boolean
  entityCardSaveContext?: EntityCardSaveContext | null
  fieldType?: FieldKeyboardGuardType
}
