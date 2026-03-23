import type { ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'

/**
 * Layout subset for standard layout composable only (no fieldContext types → shorter import-graph chain).
 */
export interface UseFormFieldsStandardLayoutReturn<GE extends GlobalEntityKey = GlobalEntityKey> {
  inlineFields: ComputedRef<GlobalFieldKey<GE>[]>
  stackedFields: ComputedRef<GlobalFieldKey<GE>[]>
  readyInlineFields: ComputedRef<GlobalFieldKey<GE>[]>
  readyStackedFields: ComputedRef<GlobalFieldKey<GE>[]>
}
