import type { ComputedRef } from 'vue'
import type { useGlobal } from '@/composables/useGlobal'
import type { InstanceComponent } from '@/types/component'

export interface UseComponentEntityQueryReturn {
  instanceComponents: ComputedRef<InstanceComponent[]>
  getGlobalData: ReturnType<typeof useGlobal>['getGlobalData']
}
