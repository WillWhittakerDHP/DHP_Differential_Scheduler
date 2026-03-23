import { USER_ROLE_CLIENT, USER_ROLE_AGENT } from '@/constants/attendeeRoles'
import type { ContactInfoBase } from '@shared/types/contactTypes'

export interface UserRequest extends ContactInfoBase {
  userRole: typeof USER_ROLE_CLIENT | typeof USER_ROLE_AGENT | 'transaction_manager' | 'seller' | 'inspector';
  loginId?: number | null;
}

export interface UserResponse extends UserRequest {
  id: string
  createdAt: string
  updatedAt: string
}
