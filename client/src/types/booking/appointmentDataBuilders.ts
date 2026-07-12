import type { UserRequest } from '@/types/user'
import type { WizardState } from '@/types/wizard'
import type { AppointmentRequest } from '@/types/appointment'
import type { ISO8601Date } from '@shared/types/primitiveBrands'
import type { USER_ROLE_BUYER, USER_ROLE_AGENT, USER_ROLE_OWNER } from '@/constants/attendeeRoles'

export interface AttendeeSpecInput {
  info: { firstName: string; lastName: string; email: string }
  role: typeof USER_ROLE_BUYER | typeof USER_ROLE_AGENT | typeof USER_ROLE_OWNER
  shouldCreate: boolean
}

export interface CreateUserMutate {
  mutateAsync: (data: UserRequest) => Promise<{ id: string }>
}

export interface WizardBlocksForBuilders
  extends Omit<WizardState, 'selectedUserTypeBlock'> {
  selectedUserTypeBlock: { id: string } | null
}

export interface AvailabilityPayload {
  selectedDate: ISO8601Date | null
  selectedDateRangeEnd: ISO8601Date | null
  selectedTimeSlots: AppointmentRequest['selectedTimeSlots']
}

export interface BlockQuantities {
  serviceQuantities: Record<string, number>
  propertyQuantities: Record<string, number>
  optionTypeBlockQuantities: Record<string, number>
}
