/**
 * Fetch to Business Transformer
 * 
 * LEARNING: Fetches and manages business data (appointments, properties, users)
 * WHY: Business data changes frequently and needs separate cache from config data
 * PATTERN: Parallel fetch pattern similar to fetchToGlobalTransformer
 * 
 * Session 1.4.7: Created as part of data flow consolidation
 * ARCHITECTURAL DECISION: Business entities use separate ['businessData'] cache key
 * - Keeps business data changes from invalidating static configuration data
 * - Allows granular cache management for frequently changing data
 * - Mirrors globalData architecture for consistency
 */

import apiClient, {
  getAppointmentEndpoint,
  getPropertyEndpoint,
  getUserEndpoint,
} from '../api'
import type { AppointmentResponse } from '@/types/appointment'
import type { PropertyResponse } from '@/types/property'
import type { UserResponse } from '@/types/user'

/**
 * BusinessData type - unified cache for business entities
 * 
 * LEARNING: Mirrors GlobalData pattern for configuration data
 * WHY: Consistent architecture makes codebase easier to understand
 * PATTERN: Single cache key for related business entities
 */
export type BusinessData = {
  appointments: AppointmentResponse[]
  properties: PropertyResponse[]
  users: UserResponse[]
}

/**
 * Business Transformer Class
 * 
 * LEARNING: Fetches all business entities in parallel
 * WHY: Centralizes business data fetching logic
 * PATTERN: Class-based transformer matching GlobalTransformer structure
 */
export class BusinessTransformer {
  /**
   * Fetch all business entities
   * 
   * LEARNING: Fetches appointments, properties, and users in parallel
   * WHY: Parallel fetching improves load time
   * PATTERN: Promise.all() for parallel execution
   */
  async fetchAll(): Promise<BusinessData> {
    try {
      const [appointmentsResponse, propertiesResponse, usersResponse] = await Promise.all([
        apiClient.get<AppointmentResponse[]>(getAppointmentEndpoint()),
        apiClient.get<PropertyResponse[]>(getPropertyEndpoint()),
        apiClient.get<UserResponse[]>(getUserEndpoint()),
      ])

      return {
        appointments: appointmentsResponse.data,
        properties: propertiesResponse.data,
        users: usersResponse.data,
      }
    } catch (_error) {
      // Return empty data on error; let consumers handle the empty state
      return {
        appointments: [],
        properties: [],
        users: [],
      }
    }
  }
}

// Export singleton
export const businessTransformer = new BusinessTransformer()

