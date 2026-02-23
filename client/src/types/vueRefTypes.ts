/**
LEARNING: Many composables only need a `.value` holder, no...
 */
import type { ComputedRef, Ref } from 'vue'

export type ReadonlyVueRef<ValueType> = Readonly<Ref<ValueType>> | ComputedRef<ValueType>


