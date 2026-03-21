/**

PATTERN: Utility functions for entity transformatio...
 */
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import {
  normalizeBlockInstanceAgentPermissionsFromApi,
  normalizeBlockInstanceBookingModeFromApi,
  normalizeBlockInstanceDifferentialFromApi,
  normalizeEventShapeDifferentialRoleFromApi,
} from './apiEntityFieldNormalization'

export function transformApiEntity<GE extends GlobalEntityKey>(
  rawEntity: Record<string, unknown>,
  entityKey: GE
): GlobalEntity<GE> {
  const skipKeys = new Set(['id', 'entity_key', 'descriptions', 'event_shape_attendees'])
  const entries = Object.entries(rawEntity).filter(([key]) => !skipKeys.has(key))
  const transformed: Record<string, unknown> = {
    id: rawEntity.id,
    entityKey,
    ...Object.fromEntries(entries),
  }

  if (entityKey === 'blockInstance') {
    const bookingRaw = transformed.bookingMode ?? rawEntity.booking_mode
    transformed.bookingMode = normalizeBlockInstanceBookingModeFromApi(bookingRaw)
    const agentRaw = transformed.agentPermissions ?? rawEntity.agent_permissions
    transformed.agentPermissions = normalizeBlockInstanceAgentPermissionsFromApi(agentRaw)
    const diffRaw = transformed.differential ?? rawEntity.differential
    transformed.differential = normalizeBlockInstanceDifferentialFromApi(diffRaw)
  }

  if (entityKey === 'eventShape') {
    const roleRaw = transformed.differentialRole ?? rawEntity.differential_role
    transformed.differentialRole = normalizeEventShapeDifferentialRoleFromApi(roleRaw)
  }

  return transformed as GlobalEntity<GE>
}


