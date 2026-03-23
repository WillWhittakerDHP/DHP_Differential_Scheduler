/**
 * Phase 6.14 — merge persisted org defaults with availability + calendar for authoritative numbers.
 */
import type { AvailabilitySettingsData } from '../../../shared/types/availabilitySettingsDocument.js'
import type { CalendarSettingsData } from '../../../shared/types/calendarSettingsDocument.js'
import type { ResolvedNumericPolicy } from '../../../shared/types/organizationDefaults.js'
import { buildCalendarNumericOverridesFromAvailabilityAndCalendar } from '../../../shared/utils/calendarNumericOverridesFromSettings.js'
import { resolveOrganizationNumericPolicy } from '../../../shared/utils/resolveOrganizationNumericPolicy.js'
import { getOrganizationDefaultsData } from '../repositories/organizationDefaultsRepository.js'

export async function resolveNumericPolicyForAvailabilityAndCalendar(
  availability: AvailabilitySettingsData,
  calendar: CalendarSettingsData
): Promise<ResolvedNumericPolicy> {
  const org = await getOrganizationDefaultsData()
  const overrides = buildCalendarNumericOverridesFromAvailabilityAndCalendar(availability, calendar)
  return resolveOrganizationNumericPolicy(org, overrides)
}
