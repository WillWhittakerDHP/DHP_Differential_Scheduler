import type { ComputedRef, Ref } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { ReadonlyVueRef } from '@/types/vueRefTypes'
import type { EntityCardSaveContext } from '@/components/admin/generic/entityCardConstants'

export interface UseSelectHandlersOptions {
  fieldContext: FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  rawFieldValue: ReadonlyVueRef<unknown>
  fieldValue: ComputedRef<string | string[] | null>
  isMultiple: ComputedRef<boolean>
  groupedByKey: ReadonlyVueRef<Array<{ groupKey: string; groupLabel: string; entities: unknown[] }>>
  entityCardSaveContext?: EntityCardSaveContext | null
  disableAutoSave?: boolean
  isAnnotationAssignmentSelect?: ComputedRef<boolean>
}

export interface UseSelectHandlersReturn {
  isUpdatingProgrammatically: Ref<boolean>
  handleGroupChange: (groupKey: string, groupValue: string | string[] | null) => Promise<void>
  handleChange: (value: string | string[] | null) => Promise<void>
  handleFocus: () => void
  handleBlur: () => Promise<void>
  handleKeydown: (event: KeyboardEvent) => void
}
