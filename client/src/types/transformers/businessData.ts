import type { AppointmentResponse } from '@/types/appointment'
import type { PropertyResponse } from '@/types/property'
import type { UserResponse } from '@/types/user'

export type BusinessData = {
  appointments: AppointmentResponse[]
  properties: PropertyResponse[]
  users: UserResponse[]
}
