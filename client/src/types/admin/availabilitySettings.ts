import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { UseAdminSettingsFormReturnBase } from '@/types/admin/adminSettingsFormReturnBase'

export interface UseAdminAvailabilitySettingsReturn
  extends UseAdminSettingsFormReturnBase<AvailabilitySettings> {
  validateBusinessHours: () => boolean
}
