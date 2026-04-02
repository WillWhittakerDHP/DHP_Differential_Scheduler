import type { UserRoleValue } from '../../../shared/constants/roleConstants.js'
import { UserRoleBlockAlignment } from '../config/app.js'
import type { UserRoleBlockAlignment as UserRoleBlockAlignmentModel } from '../db/models/admin/user_role_block_alignment.js'

/**
 * Singleton row: first `user_role_block_alignments` row (migration seeds one empty row).
 */
export async function getUserRoleBlockAlignmentRow(): Promise<UserRoleBlockAlignmentModel | null> {
  return UserRoleBlockAlignment.findOne({
    order: [['createdAt', 'ASC']],
  })
}

export async function getAlignmentOverrides(): Promise<Partial<Record<UserRoleValue, string | null>>> {
  const row = await getUserRoleBlockAlignmentRow()
  const raw = row?.alignments
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return {}
  }
  return raw as Partial<Record<UserRoleValue, string | null>>
}

export async function saveAlignmentOverrides(
  alignments: Partial<Record<UserRoleValue, string | null>>
): Promise<Partial<Record<UserRoleValue, string | null>>> {
  let row = await getUserRoleBlockAlignmentRow()
  if (row === null) {
    row = await UserRoleBlockAlignment.create({ alignments: {} })
  }
  await row.update({ alignments: { ...alignments } })
  await row.reload()
  return row.alignments as Partial<Record<UserRoleValue, string | null>>
}
