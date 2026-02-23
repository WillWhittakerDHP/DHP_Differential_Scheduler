/**
 * PATTERN: Fetch to Business Transformer

PATTERN: Parallel fetch pattern similar t...
 */
import apiClient, {
  getAppointmentEndpoint,
  getPropertyEndpoint,
  getUserEndpoint,
} from '../api'
import type { AppointmentResponse } from '@/types/appointment'
import type { PropertyResponse } from '@/types/property'
import type { UserResponse } from '@/types/user'
import { createLogger } from '@/utils/logger'

const logger = createLogger('fetchToBusinessTransformer')

/**
 * WHY: BusinessData type - unified cache for business entities

LEARNING: Mirro...
 */
export type BusinessData = {
  appointments: AppointmentResponse[]
  properties: PropertyResponse[]
  users: UserResponse[]
}

/**
 * PATTERN: Business Transformer Class

PATTERN: Class-based transformer matching Gl...
 */
export class BusinessTransformer {
  /**
   * Fetch all business entities
   * 
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
      logger.error('Fetch business data failed', { error: _error })
      return {
        appointments: [],
        properties: [],
        users: [],
      }
    }
  }
}

export const businessTransformer = new BusinessTransformer()

