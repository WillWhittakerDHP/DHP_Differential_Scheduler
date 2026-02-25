import type { ComputedRef } from 'vue'
import type { InstanceComponent } from '@/types/component'

export interface UseComponentEntityQueryReturn {
  instanceComponents: ComputedRef<InstanceComponent[]>
  getGlobalData: ReturnType<typeof import('@/composables/useGlobal').useGlobal>['getGlobalData']
}
