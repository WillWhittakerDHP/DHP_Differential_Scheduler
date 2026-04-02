import type { DifferentialRole, DifferentialRoleStorage } from '../types/differentialRole.js'
import { parseDifferentialRole } from './differentialRoleUtils.js'

/** Feature 20 / Principles §5.1 — placement category on event_shapes. */
export type EventPlacementKind = 'primary' | 'secondary' | 'marginal' | 'floating'

/** Anchor edge for non-primary placement kinds; null for primary. */
export type EventAnchorEdge = 'start' | 'end'

const PLACEMENT_KINDS = new Set<EventPlacementKind>(['primary', 'secondary', 'marginal', 'floating'])
const ANCHOR_EDGES = new Set<EventAnchorEdge>(['start', 'end'])

export function isEventPlacementKind(value: unknown): value is EventPlacementKind {
  return typeof value === 'string' && PLACEMENT_KINDS.has(value as EventPlacementKind)
}

export function isEventAnchorEdge(value: unknown): value is EventAnchorEdge {
  return typeof value === 'string' && ANCHOR_EDGES.has(value as EventAnchorEdge)
}

/** API/body sanitizer: returns null if invalid (caller may treat as omit). */
export function sanitizeEventPlacementKindInput(raw: unknown): EventPlacementKind | null {
  if (raw === undefined || raw === null || raw === '') {
    return null
  }
  if (isEventPlacementKind(raw)) {
    return raw
  }
  return null
}

export function sanitizeEventAnchorEdgeInput(raw: unknown): EventAnchorEdge | null {
  if (raw === undefined || raw === null || raw === '') {
    return null
  }
  if (isEventAnchorEdge(raw)) {
    return raw
  }
  return null
}

/**
 * WHY: Booking PartFinalizer still keys slot math off DifferentialRole until task 20.1.3.2;
 * derive a stable role from placement so major/minor/minimizer/margin flags stay consistent post-migration.
 */
export function differentialRoleFromPlacement(
  kind: EventPlacementKind | null | undefined,
  _anchorEdge: EventAnchorEdge | null | undefined
): DifferentialRoleStorage {
  switch (kind) {
    case 'secondary':
      return 'minor'
    case 'marginal':
      return 'margin'
    case 'floating':
      return 'minimizer'
    case 'primary':
    default:
      return 'major'
  }
}

/** Client hydrate: API sends placement; normalized differentialRole for legacy consumers. */
export function eventShapeDifferentialRoleFromPlacementFields(
  placementKind: unknown,
  anchorEdge: unknown
): DifferentialRole {
  const k = sanitizeEventPlacementKindInput(placementKind) ?? 'primary'
  const e = sanitizeEventAnchorEdgeInput(anchorEdge)
  return parseDifferentialRole(differentialRoleFromPlacement(k, e))
}
