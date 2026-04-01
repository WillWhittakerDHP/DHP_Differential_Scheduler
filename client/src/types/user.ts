import {
  USER_ROLE_ADMIN,
  USER_ROLE_AGENT,
  USER_ROLE_CLIENT,
  USER_ROLE_INSPECTOR,
  USER_ROLE_OWNER,
  USER_ROLE_TRANSACTION_MANAGER,
} from '@/constants/attendeeRoles'
import type { ContactInfoBase } from '@shared/types/contactTypes'

export interface UserRequest extends ContactInfoBase {
  userRole:
    | typeof USER_ROLE_CLIENT
    | typeof USER_ROLE_AGENT
    | typeof USER_ROLE_TRANSACTION_MANAGER
    | typeof USER_ROLE_OWNER
    | typeof USER_ROLE_INSPECTOR
    | typeof USER_ROLE_ADMIN
  loginId?: number | null;
}

export interface UserResponse extends UserRequest {
  id: string
  createdAt: string
  updatedAt: string
}
