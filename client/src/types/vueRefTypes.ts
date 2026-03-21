import type { ComputedRef, Ref } from 'vue'

export type ReadonlyVueRef<ValueType> = Readonly<Ref<ValueType>> | ComputedRef<ValueType>
