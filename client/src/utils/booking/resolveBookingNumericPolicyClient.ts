/**
 * WHY: Same merge-at-read as server (`computedAvailabilityService` / appointment helpers) for client booking math.
 */
import type { AvailabilitySettings } from '@/configs/availabilitySettings'
import type { CalendarSettingsData } from '@/configs/calendarSettings/types'
import type { OrganizationDefaults, ResolvedNumericPolicy } from '@shared/types/organizationDefaults'
import type { AvailabilitySettingsData } from '@shared/types/availabilitySettingsDocument'
import type { CalendarSettingsData as SharedCalendarSettingsData } from '@shared/types/calendarSettingsDocument'
import { buildCalendarNumericOverridesFromAvailabilityAndCalendar } from '@shared/utils/calendarNumericOverridesFromSettings'
import { resolveOrganizationNumericPolicy } from '@shared/utils/resolveOrganizationNumericPolicy'

export function resolveBookingNumericPolicyFromLoadedData(
  orgDefaults: OrganizationDefaults,
  availability: AvailabilitySettings,
  calendar: CalendarSettingsData,
): ResolvedNumericPolicy {
  const overrides = buildCalendarNumericOverridesFromAvailabilityAndCalendar(
    availability as unknown as AvailabilitySettingsData,
    calendar as unknown as SharedCalendarSettingsData,
  )
  return resolveOrganizationNumericPolicy(orgDefaults, overrides)
}
