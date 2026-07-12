import {
  isEventAnchorEdge,
  isEventPlacementKind,
  type EventPlacementKind,
} from '../../../../../shared/utils/eventPlacementUtils.js'
import { EventShape } from '../../../config/app.js'
import { ENTITY_KEYS } from '../../../constants/entities.js'
import { FIELD_NAMES } from './entityConstants.js'
import {
  EVENT_SHAPE_REJECTED_DIFFERENTIAL_ROLE_CAMEL,
  EVENT_SHAPE_REJECTED_DIFFERENTIAL_ROLE_SNAKE,
} from './eventShapePayloadGuards.js'

export function isEventShapeEntityType(entityType: string): boolean {
  return entityType === ENTITY_KEYS.EVENT_SHAPE || entityType === 'eventShape'
}

function readDualKey(
  body: Record<string, unknown>,
  camelKey: string,
  snakeKey: string
): { raw: unknown; specified: boolean; err: string | null } {
  const hasCamel = Object.prototype.hasOwnProperty.call(body, camelKey)
  const hasSnake = Object.prototype.hasOwnProperty.call(body, snakeKey)
  if (hasCamel && hasSnake && body[camelKey] !== body[snakeKey]) {
    return {
      raw: undefined,
      specified: true,
      err: `Conflicting values for ${camelKey} and ${snakeKey}.`,
    }
  }
  if (hasCamel) {
    return { raw: body[camelKey], specified: true, err: null }
  }
  if (hasSnake) {
    return { raw: body[snakeKey], specified: true, err: null }
  }
  return { raw: undefined, specified: false, err: null }
}

function isEmptyAnchorValue(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

function validateEventShapeForbiddenKeys(body: Record<string, unknown>): string | null {
  if (Object.prototype.hasOwnProperty.call(body, EVENT_SHAPE_REJECTED_DIFFERENTIAL_ROLE_CAMEL)) {
    return 'Event shape does not accept differentialRole; use placementKind and anchorEdge.'
  }
  if (Object.prototype.hasOwnProperty.call(body, EVENT_SHAPE_REJECTED_DIFFERENTIAL_ROLE_SNAKE)) {
    return 'Event shape does not accept differential_role; use placement_kind and anchor_edge.'
  }
  return null
}

function isUnsetPlacementField(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

/**
 * Validates resolved placementKind + anchorEdge (after optional merge with stored row on PATCH).
 */
function validateEventShapePlacementPair(placementKind: unknown, anchorEdge: unknown): string | null {
  const hasKind = !isUnsetPlacementField(placementKind)
  const hasAnchor = !isEmptyAnchorValue(anchorEdge)

  if (!hasKind && !hasAnchor) {
    return null
  }
  if (!hasKind && hasAnchor) {
    return 'Event shape anchorEdge requires placementKind in the same request when anchor is set.'
  }
  if (!isEventPlacementKind(placementKind)) {
    return 'Invalid event shape placementKind; use primary, secondary, marginal, or floating.'
  }
  const kind = placementKind as EventPlacementKind
  if (kind === 'primary') {
    if (!isEmptyAnchorValue(anchorEdge)) {
      return 'Event shape with placementKind "primary" must not set anchorEdge (omit or null).'
    }
    return null
  }
  if (isEmptyAnchorValue(anchorEdge)) {
    return 'Event shape with a non-primary placementKind requires anchorEdge "start" or "end" in the same request.'
  }
  if (!isEventAnchorEdge(anchorEdge)) {
    return 'Invalid event shape anchorEdge; use start or end for non-primary placement.'
  }
  return null
}

function readPlacementKeysFromBody(body: Record<string, unknown>): {
  kindRd: ReturnType<typeof readDualKey>
  anchorRd: ReturnType<typeof readDualKey>
} {
  const kindRd = readDualKey(body, FIELD_NAMES.PLACEMENT_KIND, FIELD_NAMES.PLACEMENT_KIND_SNAKE)
  const anchorRd = readDualKey(body, FIELD_NAMES.ANCHOR_EDGE, FIELD_NAMES.ANCHOR_EDGE_SNAKE)
  return { kindRd, anchorRd }
}

export function validateEventShapeWritePayload(body: Record<string, unknown>): string | null {
  const forbidden = validateEventShapeForbiddenKeys(body)
  if (forbidden !== null) {
    return forbidden
  }
  const { kindRd, anchorRd } = readPlacementKeysFromBody(body)
  if (kindRd.err !== null) {
    return kindRd.err
  }
  if (anchorRd.err !== null) {
    return anchorRd.err
  }
  if (!kindRd.specified && !anchorRd.specified) {
    return null
  }
  return validateEventShapePlacementPair(
    kindRd.specified ? kindRd.raw : undefined,
    anchorRd.specified ? anchorRd.raw : undefined
  )
}

/**
 * WHY: PATCH may send only one of placementKind / anchorEdge; validate the merged end state (Phase 20.8.3).
 */
export async function validateEventShapeWritePayloadAsync(
  body: Record<string, unknown>,
  mode: 'create' | 'update',
  entityId?: string
): Promise<string | null> {
  const forbidden = validateEventShapeForbiddenKeys(body)
  if (forbidden !== null) {
    return forbidden
  }
  const { kindRd, anchorRd } = readPlacementKeysFromBody(body)
  if (kindRd.err !== null) {
    return kindRd.err
  }
  if (anchorRd.err !== null) {
    return anchorRd.err
  }

  if (mode === 'create') {
    if (!kindRd.specified && !anchorRd.specified) {
      return null
    }
    return validateEventShapePlacementPair(
      kindRd.specified ? kindRd.raw : undefined,
      anchorRd.specified ? anchorRd.raw : undefined
    )
  }

  if (!kindRd.specified && !anchorRd.specified) {
    return null
  }
  if (entityId === undefined || entityId.trim() === '') {
    return validateEventShapePlacementPair(
      kindRd.specified ? kindRd.raw : undefined,
      anchorRd.specified ? anchorRd.raw : undefined
    )
  }

  const existing = await EventShape.findByPk(entityId, {
    attributes: ['placementKind', 'anchorEdge'],
  })
  if (!existing) {
    return 'Event shape not found.'
  }
  const mergedKind = kindRd.specified ? kindRd.raw : existing.placementKind
  const mergedAnchor = anchorRd.specified ? anchorRd.raw : existing.anchorEdge
  return validateEventShapePlacementPair(mergedKind, mergedAnchor)
}

export function stripRejectedEventShapeResponseFields(row: Record<string, unknown>): void {
  delete row[EVENT_SHAPE_REJECTED_DIFFERENTIAL_ROLE_CAMEL]
  delete row[EVENT_SHAPE_REJECTED_DIFFERENTIAL_ROLE_SNAKE]
}
