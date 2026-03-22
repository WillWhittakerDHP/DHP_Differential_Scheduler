import { ALLOWED_OVERRIDE_CONSTRAINTS, type OverrideConstraintKey } from '../routes/internal/appointments/appointmentConstants.js'

export const APPOINTMENT_OVERRIDE_BOOLEAN_FIELDS = [
  'overrideConstraintCapacity',
  'overrideConstraintBuffer',
  'overrideConstraintBlackout',
  'overrideConstraintBusinessHours',
] as const

type OverrideBooleanField = (typeof APPOINTMENT_OVERRIDE_BOOLEAN_FIELDS)[number]

const KEY_TO_FIELD: Record<OverrideConstraintKey, OverrideBooleanField> = {
  capacity: 'overrideConstraintCapacity',
  buffer: 'overrideConstraintBuffer',
  blackout: 'overrideConstraintBlackout',
  businessHours: 'overrideConstraintBusinessHours',
}

export function overrideConstraintsObjectFromBooleans(row: {
  overrideConstraintCapacity?: boolean
  overrideConstraintBuffer?: boolean
  overrideConstraintBlackout?: boolean
  overrideConstraintBusinessHours?: boolean
}): Record<string, boolean> | null {
  const out: Record<string, boolean> = {}
  for (const key of ALLOWED_OVERRIDE_CONSTRAINTS) {
    const field = KEY_TO_FIELD[key]
    if (row[field] === true) {
      out[key] = true
    }
  }
  return Object.keys(out).length > 0 ? out : null
}

/** Apply validated override map to Sequelize payload fields (all four booleans set). */
export function applyValidatedOverridesToAppointmentFields(
  validated: Record<string, boolean> | null,
  target: Record<string, unknown>
): void {
  for (const key of ALLOWED_OVERRIDE_CONSTRAINTS) {
    const field = KEY_TO_FIELD[key]
    target[field] = validated !== null && validated[key] === true
  }
}

/**
 * Parse request overrideConstraints; returns undefined if key absent (no DB change on patch).
 */
export function parseOverrideConstraintsBody(raw: unknown): Record<string, boolean> | null | undefined {
  if (raw === undefined) return undefined
  if (raw === null) return null
  if (typeof raw !== 'object') return null
  const allowedSet = new Set<string>(ALLOWED_OVERRIDE_CONSTRAINTS)
  const validated = Object.entries(raw as Record<string, unknown>)
    .filter(([k]) => allowedSet.has(k))
    .reduce<Record<string, boolean>>((acc, [k, v]) => {
      acc[k] = Boolean(v)
      return acc
    }, {})
  return Object.keys(validated).length > 0 ? validated : null
}

export function stripOverrideConstraintVirtualKeysFromPlain(plain: Record<string, unknown>): void {
  for (const f of APPOINTMENT_OVERRIDE_BOOLEAN_FIELDS) {
    delete plain[f]
  }
}

export function applyOverrideConstraintsFromBodyToPayload(payload: Record<string, unknown>): void {
  const raw = payload.overrideConstraints
  const parsed = parseOverrideConstraintsBody(raw)
  if (parsed === undefined) return
  applyValidatedOverridesToAppointmentFields(parsed, payload)
  delete payload.overrideConstraints
}
