import type { USER_ROLE_CLIENT, USER_ROLE_AGENT } from '@/constants/attendeeRoles'

/**
 * WHY: User Type Definitions

LEARNING: TypeScript interfaces for user API data
WHY: Ensures type safety when working with user data
PATTERN: Match server-side model structure for consistency
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

