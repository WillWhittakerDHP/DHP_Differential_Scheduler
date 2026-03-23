import type { ComputedRef } from 'vue'
import type { ValidAdminValue } from '@/constants/primitives'

/** Shared return shape for cache-backed vs threaded entity derivation. */
export interface UseFieldContextEntityDerivedReturn {
  entityValue: ComputedRef<ValidAdminValue>
  actualPropertyName: ComputedRef<string>
}
