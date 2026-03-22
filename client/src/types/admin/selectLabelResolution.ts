import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'
import type { GlobalEntity } from '@/types/entities'

export interface UseSelectLabelResolutionOptions {
  fieldContext: FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
  currentEntity: ComputedRef<GlobalEntity<GlobalEntityKey> | null>
}

export interface UseSelectLabelResolutionReturn {
  resolvedLabel: ComputedRef<string>
}
