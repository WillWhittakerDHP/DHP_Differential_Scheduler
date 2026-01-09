/**
 * Vue Ref Types
 *
 * LEARNING: Many composables only need a `.value` holder, not specifically a `computed()` ref.
 * WHY: Some call sites pass plain `ref(...)` while others pass `computed(...)`. Requiring
 *      `ComputedRef<T>` everywhere creates avoidable TS friction (TS2739) without improving safety.
 * PATTERN: Accept a read-only ref-like type (`Ref` or `ComputedRef`) when only reading `.value`.
 */

import type { ComputedRef, Ref } from 'vue'

export type ReadonlyVueRef<ValueType> = Readonly<Ref<ValueType>> | ComputedRef<ValueType>


