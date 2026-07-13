/**

PATTERN: Utility functions for entity transformatio...
 */
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import {
  normalizeBlockInstanceOrchestratorFromApi,
  normalizeBlockInstanceWizardVisibleFromApi,
} from './apiEntityFieldNormalization'
import { sanitizeEventAnchorEdgeInput, sanitizeEventPlacementKindInput } from '@shared/utils/eventPlacementUtils'

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
  const skipKeys = new Set(['id', 'entity_key', 'descriptions', 'event_instance_attendees'])
  const entries = Object.entries(rawEntity).filter(([key]) => !skipKeys.has(key))
  const transformed: Record<string, unknown> = {
    id: rawEntity.id,
    entityKey,
    ...Object.fromEntries(entries),
  }

  if (entityKey === 'blockInstance') {
    const orchestratorRaw = transformed.orchestrator ?? rawEntity.orchestrator
    transformed.orchestrator = normalizeBlockInstanceOrchestratorFromApi(orchestratorRaw)
    const wizardRaw = transformed.wizardVisible ?? rawEntity.wizard_visible
    transformed.wizardVisible = normalizeBlockInstanceWizardVisibleFromApi(wizardRaw)
  }

  if (entityKey === 'eventShape') {
    const pkRaw = transformed.placementKind ?? rawEntity.placement_kind
    const aeRaw = transformed.anchorEdge ?? rawEntity.anchor_edge
    transformed.placementKind = sanitizeEventPlacementKindInput(pkRaw) ?? 'primary'
    const anchorParsed = sanitizeEventAnchorEdgeInput(aeRaw)
    transformed.anchorEdge =
      transformed.placementKind === 'primary' ? null : anchorParsed ?? 'start'
    delete transformed.includeRescheduleLink
    delete transformed.includeCancelLink
    delete transformed.differential_role
    delete transformed.include_reschedule_link
    delete transformed.include_cancel_link
    delete transformed.differentialRole
  }

  if (entityKey === 'eventInstance') {
    const rescheduleRaw = transformed.includeRescheduleLink ?? rawEntity.include_reschedule_link
    const cancelRaw = transformed.includeCancelLink ?? rawEntity.include_cancel_link
    transformed.includeRescheduleLink = normalizeEventShapeInviteLinkFlag(rescheduleRaw)
    transformed.includeCancelLink = normalizeEventShapeInviteLinkFlag(cancelRaw)
  }

  return transformed as GlobalEntity<GE>
}


