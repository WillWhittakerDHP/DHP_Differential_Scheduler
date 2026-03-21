import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntity } from '@/types/entities'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { ReadonlyVueRef } from '@/types/vueRefTypes'

export interface UseSelectFilteringOptions {
  allEntities: ComputedRef<GlobalEntity<GlobalEntityKey>[]>
  selectConfig: ComputedRef<RelationshipFieldType<GlobalEntityKey> | VirtualFieldType<GlobalEntityKey> | undefined>
  currentEntity: ComputedRef<GlobalEntity<GlobalEntityKey> | undefined>
  optionEntityKey: ComputedRef<GlobalEntityKey>
  fieldContext: FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  rawFieldValue: ReadonlyVueRef<unknown>
  isAnnotationAssignmentSelect: ComputedRef<boolean>
  isAttendeeSelect: ComputedRef<boolean>
}

export interface UseSelectFilteringReturn {
  filteredEntities: ComputedRef<GlobalEntity<GlobalEntityKey>[]>
  isActiveChildSelect: ComputedRef<boolean>
  isDirectMatchingSelect: ComputedRef<boolean>
  parentTypeEntityKey: ComputedRef<GlobalEntityKey | null>
  parentTypeRef: ComputedRef<string | null>
  parentTypeEntity: ComputedRef<GlobalEntity<GlobalEntityKey> | null>
  isAttendeeSelect: ComputedRef<boolean>
}
