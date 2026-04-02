/**
 * API client for user role ↔ user-type block instance alignment (GET/PUT /user-role-block-alignment).
 */
import type { UserRoleValue } from '@shared/constants/roleConstants'
import type { UserRoleBlockAlignmentDto } from '@shared/types/userRoleBlockAlignment'
import apiClient from '@/utils/api'
import { createLogger } from '@/utils/logger'

const logger = createLogger('userRoleBlockAlignmentApi')

export async function getUserRoleBlockAlignment(): Promise<Partial<Record<UserRoleValue, string | null>>> {
  try {
    const response = await apiClient.get<{ alignments?: unknown }>('/user-role-block-alignment')
    const raw = response.data?.alignments
    if (raw === null || raw === undefined) {
      return {}
    }
    if (typeof raw !== 'object' || Array.isArray(raw)) {
      throw new Error('Invalid API response: alignments must be an object')
    }
    return raw as Partial<Record<UserRoleValue, string | null>>
  } catch (error) {
    logger.error('Failed to fetch user role block alignment', { error })
    const message = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`Failed to fetch user role block alignment: ${message}`)
  }
}

export async function putUserRoleBlockAlignment(
  dto: UserRoleBlockAlignmentDto
): Promise<Partial<Record<UserRoleValue, string | null>>> {
  const response = await apiClient.put<{ alignments?: Partial<Record<UserRoleValue, string | null>> }>(
    '/user-role-block-alignment',
    dto
  )
  const raw = response.data?.alignments
  if (raw === null || raw === undefined || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Invalid API response: missing alignments')
  }
  return raw
}
