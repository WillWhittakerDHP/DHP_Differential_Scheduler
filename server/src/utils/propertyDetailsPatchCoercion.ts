/**
 * WHY: Isolate PATCH field coercion for property details (mass-assignment safety + audit/complexity).
 */

import {
  ERROR_MESSAGES,
  FOUNDATION_ACCESS_VALUES,
  PATCH_PROPERTY_FIELD_KEY,
  PROPERTY_SOURCE_VALUES,
} from '../routes/internal/properties/propertyConstants.js'

export type CoercePatchPropertyFieldResult =
  | { ok: true; patch: Record<string, unknown> }
  | { ok: false; error: string; details?: Record<string, unknown> }

function coerceMlsNumberPatch(value: unknown): CoercePatchPropertyFieldResult {
  return {
    ok: true,
    patch: {
      mlsNumber: value === null ? null : typeof value === 'string' ? value : String(value),
    },
  }
}

function coerceIntegerNullableFieldPatch(
  key: string,
  value: unknown
): CoercePatchPropertyFieldResult {
  if (value === null) {
    return { ok: true, patch: { [key]: null } }
  }
  const n = Number(value)
  return { ok: true, patch: { [key]: Number.isInteger(n) ? n : null } }
}

function coerceBathroomsPatch(value: unknown): CoercePatchPropertyFieldResult {
  if (value === null) {
    return { ok: true, patch: { bathrooms: null } }
  }
  const n = Number(value)
  return { ok: true, patch: { bathrooms: Number.isFinite(n) ? n : null } }
}

function coerceFoundationAccessPatch(key: string, value: unknown): CoercePatchPropertyFieldResult {
  if (value === null) {
    return { ok: true, patch: { foundationAccess: null } }
  }
  if (typeof value === 'string' && (FOUNDATION_ACCESS_VALUES as readonly string[]).includes(value)) {
    return { ok: true, patch: { foundationAccess: value } }
  }
  return {
    ok: false,
    error: ERROR_MESSAGES.INVALID_PATCH_BODY,
    details: { field: key, allowed: [...FOUNDATION_ACCESS_VALUES] },
  }
}

function coerceSourcePatch(key: string, value: unknown): CoercePatchPropertyFieldResult {
  if (typeof value === 'string' && (PROPERTY_SOURCE_VALUES as readonly string[]).includes(value)) {
    return { ok: true, patch: { source: value } }
  }
  return {
    ok: false,
    error: ERROR_MESSAGES.INVALID_PATCH_BODY,
    details: { field: key, allowed: [...PROPERTY_SOURCE_VALUES] },
  }
}

export function coercePatchPropertyField(key: string, value: unknown): CoercePatchPropertyFieldResult {
  switch (key) {
    case PATCH_PROPERTY_FIELD_KEY.MLS_NUMBER:
      return coerceMlsNumberPatch(value)
    case PATCH_PROPERTY_FIELD_KEY.SQUARE_FOOTAGE:
    case PATCH_PROPERTY_FIELD_KEY.BEDROOMS:
    case PATCH_PROPERTY_FIELD_KEY.ADDITIONAL_UNITS:
      return coerceIntegerNullableFieldPatch(key, value)
    case PATCH_PROPERTY_FIELD_KEY.BATHROOMS:
      return coerceBathroomsPatch(value)
    case PATCH_PROPERTY_FIELD_KEY.FOUNDATION_ACCESS:
      return coerceFoundationAccessPatch(key, value)
    case PATCH_PROPERTY_FIELD_KEY.SOURCE:
      return coerceSourcePatch(key, value)
    default:
      return { ok: true, patch: { [key]: value } }
  }
}
