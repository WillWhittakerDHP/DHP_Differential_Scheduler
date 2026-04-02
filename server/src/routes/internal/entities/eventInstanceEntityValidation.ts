import { ENTITY_KEYS } from '../../../constants/entities.js'
import { TEMPORARY_ID_PATTERNS } from './entityConstants.js'

export function isEventInstanceEntityType(entityType: string): boolean {
  return entityType === ENTITY_KEYS.EVENT_INSTANCE
}

const PARENT_CAMEL = 'parentBlockInstanceId'
const PARENT_SNAKE = 'parent_block_instance_id'

/** Aligned with `validateUserRoleBlockAlignmentPayload` UUID check (entity layer stays local). */
function isUuidString(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
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

function parentUuidErrorMessage(): string {
  return 'Event instance requires a valid parent block instance id.'
}

function parentUuidUpdateErrorMessage(): string {
  return 'parentBlockInstanceId cannot be null, empty, or a temporary id when provided.'
}

function validatePersistentUuidValue(
  value: unknown,
  messages: { empty: string; invalid: string }
): string | null {
  if (value === null || value === undefined) {
    return messages.empty
  }
  if (typeof value !== 'string' || value.trim() === '') {
    return messages.empty
  }
  if (value.startsWith(TEMPORARY_ID_PATTERNS.NEW_PREFIX) || value === TEMPORARY_ID_PATTERNS.NULL_UUID) {
    return messages.invalid
  }
  if (!isUuidString(value)) {
    return messages.invalid
  }
  return null
}

const CREATE_PARENT_MSG = { empty: parentUuidErrorMessage(), invalid: parentUuidErrorMessage() }
const UPDATE_PARENT_MSG = {
  empty: parentUuidUpdateErrorMessage(),
  invalid: parentUuidUpdateErrorMessage(),
}

export function validateEventInstanceParentForCreate(body: Record<string, unknown>): string | null {
  const rd = readDualKey(body, PARENT_CAMEL, PARENT_SNAKE)
  if (rd.err !== null) {
    return rd.err
  }
  if (!rd.specified) {
    return 'Event instance create requires parentBlockInstanceId (or parent_block_instance_id).'
  }
  return validatePersistentUuidValue(rd.raw, CREATE_PARENT_MSG)
}

export function validateEventInstanceParentForUpdate(body: Record<string, unknown>): string | null {
  const rd = readDualKey(body, PARENT_CAMEL, PARENT_SNAKE)
  if (rd.err !== null) {
    return rd.err
  }
  if (!rd.specified) {
    return null
  }
  return validatePersistentUuidValue(rd.raw, UPDATE_PARENT_MSG)
}

const VISIBILITY = new Set(['default', 'public', 'private', 'confidential'])
const TRANSPARENCY = new Set(['opaque', 'transparent'])
const SEND_UPDATES = new Set(['all', 'externalOnly', 'none'])
const STATUS = new Set(['confirmed', 'tentative'])

const BOOLEAN_FIELD_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['guestsCanModify', 'guests_can_modify'],
  ['guestsCanInviteOthers', 'guests_can_invite_others'],
  ['guestsCanSeeOtherGuests', 'guests_can_see_other_guests'],
  ['addConferenceLink', 'add_conference_link'],
  ['active', 'active'],
  ['includeRescheduleLink', 'include_reschedule_link'],
  ['includeCancelLink', 'include_cancel_link'],
]

const NULLABLE_STRING_FIELD_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['locationType', 'location_type'],
  ['locationPlaceId', 'location_place_id'],
  ['locationAddress', 'location_address'],
  ['titleTemplate', 'title_template'],
  ['descriptionTemplate', 'description_template'],
  ['locationTemplate', 'location_template'],
  ['colorId', 'color_id'],
]

function validateNullableStringField(camel: string, raw: unknown): string | null {
  if (raw === null) {
    return null
  }
  if (typeof raw === 'string') {
    return null
  }
  return `Invalid type for ${camel}; expected string or null.`
}

function validateLocationCoord(camel: string, raw: unknown): string | null {
  if (raw === null) {
    return null
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return null
  }
  return `Invalid type for ${camel}; expected a finite number or null.`
}

export function validateEventInstanceSegmentFieldsWhenPresent(body: Record<string, unknown>): string | null {
  for (const [camel, snake] of BOOLEAN_FIELD_PAIRS) {
    const rd = readDualKey(body, camel, snake)
    if (rd.err !== null) {
      return rd.err
    }
    if (!rd.specified) {
      continue
    }
    if (typeof rd.raw !== 'boolean') {
      return `Invalid type for ${camel}; expected boolean.`
    }
  }

  const visibilityRd = readDualKey(body, 'visibility', 'visibility')
  if (visibilityRd.err !== null) {
    return visibilityRd.err
  }
  if (
    visibilityRd.specified &&
    (typeof visibilityRd.raw !== 'string' || !VISIBILITY.has(visibilityRd.raw))
  ) {
    return 'Invalid visibility; use default, public, private, or confidential.'
  }

  const transparencyRd = readDualKey(body, 'transparency', 'transparency')
  if (transparencyRd.err !== null) {
    return transparencyRd.err
  }
  if (
    transparencyRd.specified &&
    (typeof transparencyRd.raw !== 'string' || !TRANSPARENCY.has(transparencyRd.raw))
  ) {
    return 'Invalid transparency; use opaque or transparent.'
  }

  const sendRd = readDualKey(body, 'sendUpdates', 'send_updates')
  if (sendRd.err !== null) {
    return sendRd.err
  }
  if (sendRd.specified && (typeof sendRd.raw !== 'string' || !SEND_UPDATES.has(sendRd.raw))) {
    return 'Invalid sendUpdates; use all, externalOnly, or none.'
  }

  const statusRd = readDualKey(body, 'status', 'status')
  if (statusRd.err !== null) {
    return statusRd.err
  }
  if (statusRd.specified && (typeof statusRd.raw !== 'string' || !STATUS.has(statusRd.raw))) {
    return 'Invalid status; use confirmed or tentative.'
  }

  const latRd = readDualKey(body, 'locationLat', 'location_lat')
  if (latRd.err !== null) {
    return latRd.err
  }
  if (latRd.specified) {
    const latErr = validateLocationCoord('locationLat', latRd.raw)
    if (latErr !== null) {
      return latErr
    }
  }

  const lngRd = readDualKey(body, 'locationLng', 'location_lng')
  if (lngRd.err !== null) {
    return lngRd.err
  }
  if (lngRd.specified) {
    const lngErr = validateLocationCoord('locationLng', lngRd.raw)
    if (lngErr !== null) {
      return lngErr
    }
  }

  for (const [camel, snake] of NULLABLE_STRING_FIELD_PAIRS) {
    const rd = readDualKey(body, camel, snake)
    if (rd.err !== null) {
      return rd.err
    }
    if (!rd.specified) {
      continue
    }
    const sErr = validateNullableStringField(camel, rd.raw)
    if (sErr !== null) {
      return sErr
    }
  }

  const remRd = readDualKey(body, 'reminderOverrides', 'reminder_overrides')
  if (remRd.err !== null) {
    return remRd.err
  }
  if (!remRd.specified || remRd.raw === null) {
    return null
  }
  if (!Array.isArray(remRd.raw)) {
    return 'reminderOverrides must be an array or null.'
  }
  for (const item of remRd.raw) {
    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      return 'Each reminder override must be an object.'
    }
    const o = item as Record<string, unknown>
    if (o.method !== 'email' && o.method !== 'popup') {
      return 'reminderOverrides entries require method "email" or "popup".'
    }
    if (typeof o.minutes !== 'number' || !Number.isFinite(o.minutes)) {
      return 'reminderOverrides entries require a finite minutes number.'
    }
  }

  return null
}

export function validateEventInstanceWritePayload(
  body: Record<string, unknown>,
  mode: 'create' | 'update'
): string | null {
  if (mode === 'create') {
    const parentErr = validateEventInstanceParentForCreate(body)
    if (parentErr !== null) {
      return parentErr
    }
  } else {
    const parentErr = validateEventInstanceParentForUpdate(body)
    if (parentErr !== null) {
      return parentErr
    }
  }
  return validateEventInstanceSegmentFieldsWhenPresent(body)
}
