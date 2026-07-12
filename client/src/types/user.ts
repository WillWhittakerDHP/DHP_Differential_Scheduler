import {
  USER_ROLE_ADMIN,
  USER_ROLE_AGENT,
  USER_ROLE_BUYER,
  USER_ROLE_INSPECTOR,
  USER_ROLE_OWNER,
} from '@/constants/attendeeRoles'
import type { ContactInfoBase } from '@shared/types/contactTypes'

export interface UserRequest extends ContactInfoBase {
  userRole:
    | typeof USER_ROLE_BUYER
    | typeof USER_ROLE_AGENT
    | typeof USER_ROLE_OWNER
    | typeof USER_ROLE_INSPECTOR
    | typeof USER_ROLE_ADMIN
  loginId?: number | null
}

export interface UserResponse extends UserRequest {
  id: string
  createdAt: string
  updatedAt: string
}
