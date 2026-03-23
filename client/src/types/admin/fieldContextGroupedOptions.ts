import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldContextTypeGrouped } from '@/composables/fieldContext/types'

/** Shared options slice for select-related composables keyed by grouped field context. */
export interface FieldContextGroupedOptions {
  fieldContext: FieldContextTypeGrouped<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>
}
