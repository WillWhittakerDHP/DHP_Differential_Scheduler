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

/**
 * Helper Function: Sum Work Hours for Date Range
 * LEARNING: Calculates total scheduled work hours for a date range (inclusive)
 * WHY: Used for calendar week and rolling week capacity calculations
 * PATTERN: Query appointments in date range and sum durations from selectedTimeSlots
 * 
 * @param startDate - Start date of range (inclusive)
 * @param endDate - End date of range (inclusive)
 * @returns Total work hours in the date range
 */
export async function sumWorkHoursForDateRange(startDate: Date, endDate: Date): Promise<number> {
  try {
    // Import Appointment model and Sequelize operators dynamically to avoid circular dependencies
    const { Appointment } = await import('../../db/models/booking/appointment.js');
    const { Op } = await import('sequelize');
    
    // Convert dates to YYYY-MM-DD format for DATEONLY comparison
    const startDateOnly = startDate.toISOString().split('T')[0];
    const endDateOnly = endDate.toISOString().split('T')[0];
    
    // Query appointments in the date range with scheduled statuses
    const appointments = await Appointment.findAll({
      where: {
        selectedDate: {
          [Op.between]: [startDateOnly, endDateOnly]
        },
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
    console.error(`[ERROR] Failed to sum work hours for date range ${startDate.toISOString()} to ${endDate.toISOString()}:`, errorMessage);
    
    // Return 0 as safe default (allows scheduling if query fails)
    return 0;
  }
}

/**
 * Helper Function: Sum Work Hours for Calendar Week
 * LEARNING: Calculates total scheduled work hours for the calendar week (Monday-Sunday) containing the date
 * WHY: Used for calendar week capacity filter
 * PATTERN: Calculate Monday and Sunday of the week, then query date range
 * 
 * @param date - Date within the calendar week
 * @returns Total work hours in the calendar week (Monday-Sunday)
 */
export async function sumWorkHoursForCalendarWeek(date: Date): Promise<number> {
  try {
    // LEARNING: Use UTC methods for all date calculations
    // WHY: Ensures consistent behavior regardless of server timezone
    // Get the day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday) in UTC
    const dayOfWeek = date.getUTCDay();
    
    // Calculate days from Monday (Monday = 0, Sunday = 6)
    // If it's Sunday (dayOfWeek = 0), we need to go back 6 days to get Monday
    // Otherwise, go back (dayOfWeek - 1) days to get Monday
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    // Calculate Monday of the week in UTC
    const monday = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() - daysFromMonday,
      0, 0, 0, 0
    ));
    
    // Calculate Sunday of the week in UTC (6 days after Monday)
    const sunday = new Date(Date.UTC(
      monday.getUTCFullYear(),
      monday.getUTCMonth(),
      monday.getUTCDate() + 6,
      23, 59, 59, 999
    ));
    
    // Use date range function to sum hours
    return await sumWorkHoursForDateRange(monday, sunday);
  } catch (error) {
    // LEARNING: Handle errors gracefully with logging
    // WHY: Prevents crashes and provides debugging information
    // PATTERN: Log error with context, return safe default
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] Failed to sum work hours for calendar week containing ${date.toISOString()}:`, errorMessage);
    
    // Return 0 as safe default (allows scheduling if query fails)
    return 0;
  }
}

/**
 * Rolling week direction type
 * LEARNING: Defines how rolling 7-day window is calculated
 * WHY: Different businesses may prefer different rolling week calculations
 */
export type RollingWeekDirection = 'past' | 'centered' | 'future'

/**
 * Helper Function: Sum Work Hours for Rolling Week
 * LEARNING: Calculates total scheduled work hours for a rolling 7-day window based on direction
 * WHY: Used for rolling week capacity filter with configurable direction
 * PATTERN: Calculate date range based on direction, then query date range
 * 
 * @param date - Reference date for rolling week calculation
 * @param direction - Direction of rolling week ('past', 'centered', or 'future')
 * @returns Total work hours in the rolling 7-day window
 */
export async function sumWorkHoursForRollingWeek(date: Date, direction: RollingWeekDirection): Promise<number> {
  try {
    // LEARNING: Use UTC methods for all date calculations
    // WHY: Ensures consistent behavior regardless of server timezone
    let startDate: Date;
    let endDate: Date;
    
    // Create reference date at start of day in UTC
    const referenceDateUTC = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0, 0, 0, 0
    ));
    
    switch (direction) {
      case 'past':
        // Past 7 days: 6 days before + reference date (7 days total)
        endDate = new Date(Date.UTC(
          referenceDateUTC.getUTCFullYear(),
          referenceDateUTC.getUTCMonth(),
          referenceDateUTC.getUTCDate(),
          23, 59, 59, 999
        ));
        startDate = new Date(Date.UTC(
          referenceDateUTC.getUTCFullYear(),
          referenceDateUTC.getUTCMonth(),
          referenceDateUTC.getUTCDate() - 6,
          0, 0, 0, 0
        ));
        break;
        
      case 'centered':
        // Centered: 3 days before + reference date + 3 days after (7 days total)
        startDate = new Date(Date.UTC(
          referenceDateUTC.getUTCFullYear(),
          referenceDateUTC.getUTCMonth(),
          referenceDateUTC.getUTCDate() - 3,
          0, 0, 0, 0
        ));
        endDate = new Date(Date.UTC(
          referenceDateUTC.getUTCFullYear(),
          referenceDateUTC.getUTCMonth(),
          referenceDateUTC.getUTCDate() + 3,
          23, 59, 59, 999
        ));
        break;
        
      case 'future':
        // Future 7 days: reference date + next 6 days (7 days total)
        startDate = new Date(Date.UTC(
          referenceDateUTC.getUTCFullYear(),
          referenceDateUTC.getUTCMonth(),
          referenceDateUTC.getUTCDate(),
          0, 0, 0, 0
        ));
        endDate = new Date(Date.UTC(
          referenceDateUTC.getUTCFullYear(),
          referenceDateUTC.getUTCMonth(),
          referenceDateUTC.getUTCDate() + 6,
          23, 59, 59, 999
        ));
        break;
        
      default:
        // Default to past if invalid direction
        console.warn(`[WARN] Invalid rolling week direction: ${direction}, defaulting to 'past'`);
        endDate = new Date(Date.UTC(
          referenceDateUTC.getUTCFullYear(),
          referenceDateUTC.getUTCMonth(),
          referenceDateUTC.getUTCDate(),
          23, 59, 59, 999
        ));
        startDate = new Date(Date.UTC(
          referenceDateUTC.getUTCFullYear(),
          referenceDateUTC.getUTCMonth(),
          referenceDateUTC.getUTCDate() - 6,
          0, 0, 0, 0
        ));
    }
    
    // Use date range function to sum hours
    return await sumWorkHoursForDateRange(startDate, endDate);
  } catch (error) {
    // LEARNING: Handle errors gracefully with logging
    // WHY: Prevents crashes and provides debugging information
    // PATTERN: Log error with context, return safe default
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] Failed to sum work hours for rolling week (${direction}) containing ${date.toISOString()}:`, errorMessage);
    
    // Return 0 as safe default (allows scheduling if query fails)
    return 0;
  }
}

