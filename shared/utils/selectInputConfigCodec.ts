/**
 * Parse / serialize / merge select `inputConfig` wire JSON.
 * WHY: Shared client/server; rejects forbidden targetMode `property`.
 */

import {
  type ParsedSelectInputConfig,
  type SelectInputConfig,
  type SelectInputConfigPassthrough,
  SELECT_INPUT_CONFIG_PASSTHROUGH_KEYS,
  ForbiddenSelectInputTargetModeError,
} from '../types/selectInputConfig.js'

export { ForbiddenSelectInputTargetModeError } from '../types/selectInputConfig.js'

export function unwrapLegacyRelationshipSelect(raw: Record<string, unknown>): Record<string, unknown> {
  if ('targetMode' in raw) {
    return raw
  }
  if (!('relationshipSelect' in raw)) {
    return raw
  }
  const wrapped = raw.relationshipSelect
  if (typeof wrapped === 'object' && wrapped !== null && 'targetMode' in wrapped) {
    return wrapped as Record<string, unknown>
  }
  return raw
}

export function assertSelectInputConfigNotPropertyTargetMode(raw: unknown): void {
  if (raw === null || raw === undefined || typeof raw !== 'object' || Array.isArray(raw)) {
    return
  }
  const unwrapped = unwrapLegacyRelationshipSelect(raw as Record<string, unknown>)
  const tm = unwrapped.targetMode
  if (tm === 'property') {
    throw new ForbiddenSelectInputTargetModeError()
  }
}

function pickPassthrough(source: Record<string, unknown>): SelectInputConfigPassthrough {
  const out: SelectInputConfigPassthrough = {}
  for (const key of SELECT_INPUT_CONFIG_PASSTHROUGH_KEYS) {
    if (key in source && source[key] !== undefined) {
      out[key] = source[key]
    }
  }
  return out
}

function removeKeys(obj: Record<string, unknown>, keys: readonly string[]): Record<string, unknown> {
  const next: Record<string, unknown> = { ...obj }
  for (const k of keys) {
    delete next[k]
  }
  return next
}

function parseStaticOptionsCore(obj: Record<string, unknown>): SelectInputConfig {
  const options = obj.options
  if (!Array.isArray(options)) {
    throw new Error('[selectInputConfigCodec] staticOptions requires options array')
  }
  const selectMode = obj.selectMode
  return {
    kind: 'staticOptions',
    options,
    selectMode: typeof selectMode === 'string' ? selectMode : undefined,
  }
}

function buildOpaqueResidual(unwrapped: Record<string, unknown>): Record<string, unknown> {
  let rest = removeKeys(unwrapped, ['relationshipSelect'])
  rest = removeKeys(rest, [...SELECT_INPUT_CONFIG_PASSTHROUGH_KEYS])
  return rest
}

function parseRelationshipOrPrimitiveCore(
  obj: Record<string, unknown>,
  targetMode: string
): SelectInputConfig {
  let wire = removeKeys(obj, ['relationshipSelect'])
  wire = removeKeys(wire, [...SELECT_INPUT_CONFIG_PASSTHROUGH_KEYS])
  if (targetMode === 'relationship') {
    return { kind: 'relationship', wire }
  }
  if (targetMode === 'primitive') {
    return { kind: 'primitive', wire }
  }
  throw new Error(
    `[selectInputConfigCodec] Unsupported targetMode "${targetMode}"; expected relationship or primitive.`
  )
}

/**
 * Structural parse of wire `inputConfig`. Throws {@link ForbiddenSelectInputTargetModeError} if `targetMode === 'property'`.
 */
export function parseInputConfig(raw: unknown): ParsedSelectInputConfig {
  if (raw === null || raw === undefined) {
    return { core: null, passthrough: {}, opaque: {} }
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return { core: null, passthrough: {}, opaque: {} }
  }

  const obj = raw as Record<string, unknown>
  const unwrapped = unwrapLegacyRelationshipSelect(obj)

  const tm = unwrapped.targetMode
  if (tm === 'property') {
    throw new ForbiddenSelectInputTargetModeError()
  }

  const passthrough = pickPassthrough(unwrapped)

  if (Array.isArray(unwrapped.options)) {
    let opaque = buildOpaqueResidual(unwrapped)
    opaque = removeKeys(opaque, ['options', 'selectMode', 'targetMode'])
    return { core: parseStaticOptionsCore(unwrapped), passthrough, opaque }
  }

  if (typeof tm === 'string' && tm !== '') {
    return {
      core: parseRelationshipOrPrimitiveCore(unwrapped, tm),
      passthrough,
      opaque: {},
    }
  }

  const opaque = buildOpaqueResidual(unwrapped)
  const hasPassthrough = Object.keys(passthrough).length > 0
  if (Object.keys(opaque).length === 0 && !hasPassthrough) {
    return { core: null, passthrough: {}, opaque: {} }
  }

  return { core: null, passthrough, opaque }
}

function serializeCore(core: SelectInputConfig | null): Record<string, unknown> {
  if (core === null) {
    return {}
  }
  if (core.kind === 'staticOptions') {
    const out: Record<string, unknown> = { options: core.options }
    if (core.selectMode !== undefined) {
      out.selectMode = core.selectMode
    }
    return out
  }
  if (core.kind === 'relationship' || core.kind === 'primitive') {
    return { ...core.wire }
  }
  return {}
}

/**
 * Flat wire JSON: no `kind`; targetMode only `relationship` | `primitive` for non-static configs.
 */
export function serializeInputConfig(parsed: ParsedSelectInputConfig): Record<string, unknown> {
  return {
    ...parsed.opaque,
    ...serializeCore(parsed.core),
    ...parsed.passthrough,
  }
}

function isOptionsOnlyBuilt(built: Record<string, unknown>): boolean {
  const keys = Object.keys(built)
  return keys.length === 1 && keys[0] === 'options'
}

/**
 * Merge editor-built partial into existing wire config; preserves passthrough and opaque keys from existing.
 */
export function mergeSelectInputConfig(
  existingRaw: Record<string, unknown> | null | undefined,
  built: Record<string, unknown> | null
): Record<string, unknown> | null {
  const existing =
    existingRaw !== null && existingRaw !== undefined && typeof existingRaw === 'object' && !Array.isArray(existingRaw)
      ? { ...existingRaw }
      : {}

  assertSelectInputConfigNotPropertyTargetMode(existing)

  if (built === null) {
    // Form cleared selectMode; preserve full existing blob (matches legacy inputConfigEditor).
    return Object.keys(existing).length > 0 ? { ...existing } : null
  }

  if (isOptionsOnlyBuilt(built)) {
    assertSelectInputConfigNotPropertyTargetMode({ ...existing, ...built })
    return { ...existing, options: built.options as unknown }
  }

  const merged = { ...existing, ...built }
  assertSelectInputConfigNotPropertyTargetMode(merged)
  return merged
}
