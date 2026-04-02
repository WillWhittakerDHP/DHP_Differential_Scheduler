/**

PATTERN: Utility functions for entity transformatio...
 */
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import {
  normalizeBlockInstanceAgentPermissionsFromApi,
  normalizeBlockInstanceOrchestratorFromApi,
  normalizeBlockInstanceWizardVisibleFromApi,
  normalizeEventShapeDifferentialRoleFromApi,
} from './apiEntityFieldNormalization'

/**
 * Invite link toggles on event shapes are NOT NULL default true in DB.
 * Only boolean true or the string 'true' enable the flag when a value is present;
 * 0, null, '', and other non-boolean noise must not be treated as enabled.
 */
function normalizeEventShapeInviteLinkFlag(raw: unknown): boolean {
  if (raw === undefined) {
    return true
  }
  return raw === true || raw === 'true'
}

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
    const agentRaw = transformed.agentPermissions ?? rawEntity.agent_permissions
    transformed.agentPermissions = normalizeBlockInstanceAgentPermissionsFromApi(agentRaw)
    const orchestratorRaw = transformed.orchestrator ?? rawEntity.orchestrator
    transformed.orchestrator = normalizeBlockInstanceOrchestratorFromApi(orchestratorRaw)
    const wizardRaw = transformed.wizardVisible ?? rawEntity.wizard_visible
    transformed.wizardVisible = normalizeBlockInstanceWizardVisibleFromApi(wizardRaw)
  }

  if (entityKey === 'eventShape') {
    const roleRaw = transformed.differentialRole ?? rawEntity.differential_role
    transformed.differentialRole = normalizeEventShapeDifferentialRoleFromApi(roleRaw)
    const rescheduleRaw = transformed.includeRescheduleLink ?? rawEntity.include_reschedule_link
    const cancelRaw = transformed.includeCancelLink ?? rawEntity.include_cancel_link
    transformed.includeRescheduleLink = normalizeEventShapeInviteLinkFlag(rescheduleRaw)
    transformed.includeCancelLink = normalizeEventShapeInviteLinkFlag(cancelRaw)
  }

  return transformed as GlobalEntity<GE>
}


