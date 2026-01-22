/**
 * Helper Function: Fetch Available Days
 * LEARNING: Fetches available days for a service from database
 * WHY: Services may only be available on specific days of the week
 * PATTERN: Query block_instances table for availableDays field, default to all days if not configured
 * NOTE: Returns day indices (0 = Sunday, 6 = Saturday)
 * 
 * IMPLEMENTED: Database-backed available days query
 * ============================================================================
 * Queries block_instances table for the service's available days configuration:
 * 1. Query block_instances by id = serviceId
 * 2. Return availableDays field if configured and valid
 * 3. Default to [0,1,2,3,4,5,6] (all days) if null, not found, or invalid
 * 
 * Returns all days on error (safe default for backward compatibility)
 * ============================================================================
 */
export async function fetchAvailableDays(serviceId: string): Promise<number[]> {
  try {
    // Import BlockInstance model dynamically to avoid circular dependencies
    const { BlockInstance } = await import('../../db/models/booking/block_instance.js');
    
    // Query block instance by serviceId
    const blockInstance = await BlockInstance.findByPk(serviceId);
    
    // If found and has configured availableDays, return it
    if (blockInstance?.availableDays && Array.isArray(blockInstance.availableDays)) {
      // Validate that all values are numbers between 0-6
      const validDays = blockInstance.availableDays.filter(
        (day): day is number => typeof day === 'number' && day >= 0 && day <= 6
      );
      
      // If we have valid days, return them; otherwise default to all days
      if (validDays.length > 0) {
        return validDays;
      }
    }
    
    // Default to all days if not configured, not found, or invalid
    // LEARNING: Backward compatible - services without configuration work for all days
    // WHY: Allows existing services to continue working without requiring configuration
    // PATTERN: Safe default that enables full availability
    return [0, 1, 2, 3, 4, 5, 6];
  } catch (error) {
    // LEARNING: Handle database errors gracefully with logging
    // WHY: Prevents crashes and provides debugging information
    // PATTERN: Log error with context, return safe default
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] Failed to fetch available days for serviceId ${serviceId}:`, errorMessage);
    
    // Return all days as safe default (allows scheduling if query fails)
    return [0, 1, 2, 3, 4, 5, 6];
  }
}

/**
 * Helper Function: Sum Work Hours for Day
 * LEARNING: Calculates total scheduled work hours for a specific date
 * WHY: Used to enforce maximum work hours per day limit
 * PATTERN: Query appointments for the date and sum durations from selectedTimeSlots
 * 
 * IMPLEMENTED: Database-backed work hours calculation
 * ============================================================================
 * Queries scheduled appointments for the specific date and sums durations:
 * 1. Filters appointments by selectedDate matching the date (DATEONLY comparison)
 * 2. Only counts appointments with status 'submitted' or 'confirmed'
 * 3. Extracts durations from selectedTimeSlots array
 * 4. Sums all durations and converts minutes to hours
 * 
 * Returns 0 on error or if no appointments found (safe default)
 * ============================================================================
 */
export async function sumWorkHoursForDay(date: Date): Promise<number> {
  try {
    // Import Appointment model dynamically to avoid circular dependencies
    const { Appointment } = await import('../../db/models/booking/appointment.js');
    
    // Convert date to YYYY-MM-DD format for DATEONLY comparison
    const dateOnly = date.toISOString().split('T')[0];
    
    // Query appointments for the specific date with scheduled statuses
    const appointments = await Appointment.findAll({
      where: {
        selectedDate: dateOnly,
        status: ['submitted', 'confirmed']
      }
    });
    
    // Sum durations from all appointments' selectedTimeSlots
    let totalMinutes = 0;
    for (const appointment of appointments) {
      if (appointment.selectedTimeSlots && Array.isArray(appointment.selectedTimeSlots)) {
        for (const slot of appointment.selectedTimeSlots) {
          if (slot.duration && typeof slot.duration === 'number') {
            totalMinutes += slot.duration;
          }
        }
      }
    }
    
    // Convert minutes to hours
    const totalHours = totalMinutes / 60;
    
    return totalHours;
  } catch (error) {
    // LEARNING: Handle database errors gracefully with logging
    // WHY: Prevents crashes and provides debugging information
    // PATTERN: Log error with context, return safe default
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] Failed to sum work hours for date ${date.toISOString()}:`, errorMessage);
    
    // Return 0 as safe default (allows scheduling if query fails)
    return 0;
  }
}

