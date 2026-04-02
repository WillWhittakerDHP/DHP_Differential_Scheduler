import {
  isEventAnchorEdge,
  isEventPlacementKind,
  type EventPlacementKind,
} from '../../../../../shared/utils/eventPlacementUtils.js'
import { ENTITY_KEYS } from '../../../constants/entities.js'
import { FIELD_NAMES } from './entityConstants.js'

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

export function validateEventShapeForbiddenKeys(body: Record<string, unknown>): string | null {
  if (Object.prototype.hasOwnProperty.call(body, FIELD_NAMES.DIFFERENTIAL_ROLE)) {
    return 'Event shape does not accept differentialRole; use placementKind and anchorEdge.'
  }
  if (Object.prototype.hasOwnProperty.call(body, FIELD_NAMES.DIFFERENTIAL_ROLE_SNAKE)) {
    return 'Event shape does not accept differential_role; use placement_kind and anchor_edge.'
  }
  return null
}

/**
 * When placement or anchor keys are present, enforce Principles §5.1 pairing rules.
 */
export function validateEventShapePlacementWrite(body: Record<string, unknown>): string | null {
  const kindRd = readDualKey(body, FIELD_NAMES.PLACEMENT_KIND, FIELD_NAMES.PLACEMENT_KIND_SNAKE)
  if (kindRd.err !== null) {
    return kindRd.err
  }
  const anchorRd = readDualKey(body, FIELD_NAMES.ANCHOR_EDGE, FIELD_NAMES.ANCHOR_EDGE_SNAKE)
  if (anchorRd.err !== null) {
    return anchorRd.err
  }

  if (!kindRd.specified && !anchorRd.specified) {
    return null
  }

  if (kindRd.specified) {
    if (!isEventPlacementKind(kindRd.raw)) {
      return 'Invalid event shape placementKind; use primary, secondary, marginal, or floating.'
    }
    const kind = kindRd.raw as EventPlacementKind
    if (kind === 'primary') {
      if (!isEmptyAnchorValue(anchorRd.raw)) {
        return 'Event shape with placementKind "primary" must not set anchorEdge (omit or null).'
      }
      return null
    }
    if (isEmptyAnchorValue(anchorRd.raw)) {
      return 'Event shape with a non-primary placementKind requires anchorEdge "start" or "end" in the same request.'
    }
    if (!isEventAnchorEdge(anchorRd.raw)) {
      return 'Invalid event shape anchorEdge; use start or end for non-primary placement.'
    }
    return null
  }

  if (!isEmptyAnchorValue(anchorRd.raw)) {
    return 'Event shape anchorEdge requires placementKind in the same request when anchor is set.'
  }
  return null
}

export function validateEventShapeWritePayload(body: Record<string, unknown>): string | null {
  const forbidden = validateEventShapeForbiddenKeys(body)
  if (forbidden !== null) {
    return forbidden
  }
  return validateEventShapePlacementWrite(body)
}

export function stripLegacyEventShapeResponseFields(row: Record<string, unknown>): void {
  delete row[FIELD_NAMES.DIFFERENTIAL_ROLE]
  delete row[FIELD_NAMES.DIFFERENTIAL_ROLE_SNAKE]
}
