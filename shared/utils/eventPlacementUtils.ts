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
 * WHY: `event_shapes` no longer store `differential_role`; booking uses placement_kind + anchor_edge
 * and derives scheduling role semantics via `eventShapeDifferentialRoleFromPlacementFields`.
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

/** Maps stored placement fields to the scheduling role consumed with `effectiveDifferentialRole` overrides. */
export function eventShapeDifferentialRoleFromPlacementFields(
  placementKind: unknown,
  anchorEdge: unknown
): DifferentialRole {
  const k = sanitizeEventPlacementKindInput(placementKind) ?? 'primary'
  const e = sanitizeEventAnchorEdgeInput(anchorEdge)
  return parseDifferentialRole(differentialRoleFromPlacement(k, e))
}

/** Minimal shape for ordering calendar invite creation by `event_shapes` placement (FEATURE_20 §5.1). */
export interface EventSegmentCalendarOrderInput {
  id: string
  eventShape?: {
    placementKind?: unknown
    anchorEdge?: unknown
  } | null
}

function placementKindCalendarRank(kind: EventPlacementKind): number {
  switch (kind) {
    case 'primary':
      return 0
    case 'secondary':
      return 1
    case 'marginal':
      return 2
    case 'floating':
      return 3
    default:
      return 0
  }
}

/** start → end → null/undefined (stable tie-break after placement kind). */
function anchorEdgeCalendarRank(edge: EventAnchorEdge | null): number {
  if (edge === 'start') return 0
  if (edge === 'end') return 1
  return 2
}

/**
 * Compare two event segments for deterministic Google Calendar insert order.
 * WHY: Invite orchestration must reflect placement policy from `event_shapes`, not Sequelize row order.
 */
export function compareEventSegmentsForCalendarOrder(
  a: EventSegmentCalendarOrderInput,
  b: EventSegmentCalendarOrderInput
): number {
  const ka = sanitizeEventPlacementKindInput(a.eventShape?.placementKind) ?? 'primary'
  const kb = sanitizeEventPlacementKindInput(b.eventShape?.placementKind) ?? 'primary'
  const ra = placementKindCalendarRank(ka)
  const rb = placementKindCalendarRank(kb)
  if (ra !== rb) return ra - rb

  const ea = sanitizeEventAnchorEdgeInput(a.eventShape?.anchorEdge)
  const eb = sanitizeEventAnchorEdgeInput(b.eventShape?.anchorEdge)
  const sa = anchorEdgeCalendarRank(ea)
  const sb = anchorEdgeCalendarRank(eb)
  if (sa !== sb) return sa - sb

  return a.id.localeCompare(b.id)
}
