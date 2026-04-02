import type { UserRoleValue } from '../constants/roleConstants.js'

/** API body for PUT `/internal/user-role-block-alignment` (full replace of stored JSON). */
export interface UserRoleBlockAlignmentDto {
  alignments: Partial<Record<UserRoleValue, string | null>>
}
