
export type { AppointmentStatus } from './appointmentStatus'
export { APPOINTMENT_STATUSES, VALID_STATUS_TRANSITIONS, getValidNextStatuses } from '@/constants/appointmentStatus'

export * from './appointmentModels'

export type {
  AttendeeResponse,
  UserResponse,
  PropertyResponse,
  AppointmentRequest,
  AppointmentResponse,
} from './appointmentApi'
