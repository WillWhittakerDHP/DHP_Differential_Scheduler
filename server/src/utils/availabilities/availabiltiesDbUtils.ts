/**
 * Helper Function: Fetch Available Days
 * LEARNING: Fetches available days for a service from database
 * WHY: Services may only be available on specific days of the week
 * PATTERN: Returns all days by default until database implementation is complete
 * NOTE: Returns day indices (0 = Sunday, 6 = Saturday)
 * 
 * P0-5: IMPLEMENTATION NEEDED - Database query for service available days
 * ============================================================================
 * TODO: Implement database query for service available days
 * 
 * Current implementation returns all days [0,1,2,3,4,5,6] as a safe default.
 * This allows weekend/holiday availability until proper database implementation.
 * 
 * To implement properly:
 * 1. Create database table/field for service available days configuration
 *    - Option A: Add availableDays field to block_instances table (service configuration)
 *    - Option B: Create service_settings table with serviceId -> availableDays mapping
 *    - Option C: Add to AvailabilitySettings if this is a global setting
 * 
 * 2. Query available days for the serviceId
 *    - Filter by serviceId
 *    - Return array of day indices (0-6) when service is available
 * 
 * 3. Handle per-service vs global configuration
 *    - If per-service: query service-specific configuration
 *    - If global: use AvailabilitySettings from business_settings table
 * 
 * Related files:
 * - server/src/db/models/booking/block_instance.ts (if adding to block_instances)
 * - server/src/db/models/admin/business_settings.ts (if using AvailabilitySettings)
 * 
 * Until implemented, returns all days to allow full availability.
 * ============================================================================
 */
export async function fetchAvailableDays(serviceId: string): Promise<number[]> {
  // P0-5: Returns all days as safe default until database implementation
  // TODO: Implement database query for service-specific available days
  console.log(`[TODO] Fetching available days for serviceId: ${serviceId} - returning all days until database implementation`);
  
  // Return all days (0-6) as safe default - allows weekend/holiday availability
  // This is safer than hard-coding Mon-Fri and allows the feature to work for all days
  return [0, 1, 2, 3, 4, 5, 6]; // All days until proper database implementation
}

/**
 * Helper Function: Sum Work Hours for Day (DISABLED - P0-3)
 * LEARNING: Calculates total scheduled work hours for a specific day
 * WHY: Used to enforce maximum work hours per day limit
 * PATTERN: Currently disabled - returns 0 to effectively disable the filter
 * 
 * P0-3: DISABLED - Work hours aggregation is not implemented
 * ============================================================================
 * TODO: Implement work hours aggregation
 * 
 * This function currently always returns 0, making the work hours filter ineffective.
 * To implement properly:
 * 1. Query scheduled appointments for the day (filter by date range)
 * 2. Sum total duration of all appointments for that day
 * 3. Return total hours (duration / 60)
 * 
 * Related files:
 * - server/src/utils/availabilities/availabilityFilters.ts (duplicate stub exists)
 * - server/src/db/models/appointment.ts (Appointment model)
 * 
 * Until implemented, filterByWorkHours effectively allows all days (always passes filter).
 * ============================================================================
 */
export function sumWorkHoursForDay(dayIndex: number): number {
  // P0-3: Disabled - always returns 0 to effectively disable the filter
  // TODO: Implement proper work hours aggregation from scheduled appointments
  console.log(`[DISABLED] Summing work hours for dayIndex: ${dayIndex} - feature not implemented`);
  return 0; // Always returns 0, making filterByWorkHours always pass
}

