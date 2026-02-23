import { USER_ROLE_CLIENT, USER_ROLE_AGENT } from '@/constants/attendeeRoles'

/**
 * WHY: TypeScript interfaces for user API data
WHY: Ensures type safety when wo...
 */
export interface UserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  userRole: typeof USER_ROLE_CLIENT | typeof USER_ROLE_AGENT | 'transaction_manager' | 'seller' | 'inspector';
  loginId?: number | null;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  userRole: typeof USER_ROLE_CLIENT | typeof USER_ROLE_AGENT | 'transaction_manager' | 'seller' | 'inspector';
  loginId?: number | null;
  createdAt: string;
  updatedAt: string;
}

