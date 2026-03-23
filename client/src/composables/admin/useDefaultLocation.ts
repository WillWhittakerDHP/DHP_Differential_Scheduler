import type { WritableComputedRef } from 'vue'
import type { Coordinates } from '@/configs/availabilitySettings'
import type { UseDefaultLocationParams } from '@/types/availabilitySettingsParams'
import { buildDefaultLocationWritables } from '@/utils/availability/buildDefaultLocationWritables'

export type { UseDefaultLocationParams }

export interface UseDefaultLocationReturn {
  defaultLocationAddress: WritableComputedRef<string>
  defaultLocationLabel: WritableComputedRef<string>
  defaultLocationCoordinates: WritableComputedRef<Coordinates | undefined>
  defaultLocationPlaceId: WritableComputedRef<string>
}

export function useDefaultLocation(params: UseDefaultLocationParams): UseDefaultLocationReturn {
  return buildDefaultLocationWritables(params.formData)
}
