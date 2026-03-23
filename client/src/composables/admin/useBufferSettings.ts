/**
 * Composable for buffer settings (appointment, drive time) and lead time constraint
 */
import type { UseBufferSettingsParams, UseBufferSettingsReturn } from '@/types/availabilitySettingsParams'
import { buildBufferNestedWritables } from '@/composables/admin/bufferSettings/useBufferNestedWritables'
import { buildBufferRangeConstraintWritables } from '@/composables/admin/bufferSettings/useBufferRangeConstraintWritables'

export type { UseBufferSettingsParams, UseBufferSettingsReturn } from '@/types/availabilitySettingsParams'

export function useBufferSettings(params: UseBufferSettingsParams): UseBufferSettingsReturn {
  return {
    ...buildBufferNestedWritables(params),
    ...buildBufferRangeConstraintWritables(params),
  }
}
