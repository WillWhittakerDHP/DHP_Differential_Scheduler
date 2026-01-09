/**
 * WHY: Availability Settings Configuration

LEARNING: Client-side settings for time slot generation and business hours
WHY: Centralizes business hours and time slot configuration (admin-configurable via Business Controls tab)
PATTERN: TypeScript interface with default values, fetches from API with fallback to defaults
Session 1.3.7: Created to replace hardcoded values in generateTimeSlots
Session 1.4.1: Updated to fetch from API instead of hardcoded defaults
 */
export interface DayHours {
  start: string // Format: "HH:MM" (24-hour format, e.g., "09:00")
  end: string   // Format: "HH:MM" (24-hour format, e.g., "19:00")
}

/**
 * Availability settings interface
 * LEARNING: Complete configuration for time slot generation
 * WHY: Type-safe settings structure for availability calculations
 * PATTERN: Interface matching server-side adminSettings structure
 */
export interface AvailabilitySettings {
  /**
   * Business hours per day of week (0 = Sunday, 6 = Saturday)
   * LEARNING: Defines when appointments can be scheduled each day
   * WHY: Allows different hours per day (e.g., shorter hours on weekends)
   */
  businessHours: {
    0: DayHours // Sunday
    1: DayHours // Monday
    2: DayHours // Tuesday
    3: DayHours // Wednesday
    4: DayHours // Thursday
    5: DayHours // Friday
    6: DayHours // Saturday
  }
  
  /**
   * Time slot increment in minutes
   * LEARNING: Interval between available time slots
   * WHY: Controls granularity of appointment times (15 min = slots at :00, :15, :30, :45)
   */
  minuteIncrement: number
  
  /**
   * Minimum lead time in minutes before appointments can be booked
   * LEARNING: Buffer time required before first available slot
   * WHY: Prevents booking appointments too close to current time
   */
  leadTime: number
}

/**
 * Default availability settings
 * LEARNING: Fallback defaults matching server-side defaultAvailabilitySettings
 * WHY: Provides working configuration if API call fails or no settings exist in database
 * PATTERN: Default export with sensible business hours, used as fallback
 */
export const defaultAvailabilitySettings: AvailabilitySettings = {
  businessHours: {
    0: { start: "09:00", end: "19:00" }, // Sunday
    1: { start: "09:00", end: "19:00" }, // Monday
    2: { start: "09:00", end: "19:00" }, // Tuesday
    3: { start: "09:00", end: "19:00" }, // Wednesday
    4: { start: "09:00", end: "19:00" }, // Thursday
    5: { start: "09:00", end: "19:00" }, // Friday
    6: { start: "09:00", end: "19:00" }, // Saturday
  },
  minuteIncrement: 15, // 15-minute intervals
  leadTime: 60, // 1 hour lead time
}

import apiClient from '@/utils/api'

/**
 * In-memory cache for availability settings
 * LEARNING: Caches settings to avoid repeated API calls
 * WHY: Improves performance and reduces server load
 * PATTERN: Simple in-memory cache with null check
 */
let cachedSettings: AvailabilitySettings | null = null

/**
 * Get availability settings from API with fallback to defaults
 * LEARNING: Fetches settings from business-settings API endpoint
 * WHY: Allows admin to configure settings without code changes
 * PATTERN: API call with error handling and fallback to defaults
 * 
 * @returns Promise<AvailabilitySettings> - Settings from API or defaults
 */
export async function getAvailabilitySettings(): Promise<AvailabilitySettings> {
  // Return cached settings if available
  if (cachedSettings) {
    return cachedSettings
  }

  try {
    // Fetch settings from API
    const response = await apiClient.get('/business-settings/availability_settings')
    
    if (response.data && response.data.setting_value) {
      const settings = response.data.setting_value as AvailabilitySettings
      
      // Validate settings structure (basic check)
      if (
        settings.businessHours &&
        settings.minuteIncrement &&
        settings.leadTime !== undefined
      ) {
        cachedSettings = settings
        return settings
      }
    }
    
    // If response is invalid, fall back to defaults
    return defaultAvailabilitySettings
  } catch (error) {
    // If API call fails, fall back to defaults
    return defaultAvailabilitySettings
  }
}

/**
 * Clear cached availability settings
 * LEARNING: Allows forcing refresh of settings from API
 * WHY: Useful after admin updates settings to ensure UI reflects changes
 * PATTERN: Simple cache invalidation function
 */
export function clearAvailabilitySettingsCache(): void {
  cachedSettings = null
}

