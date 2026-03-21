/**
 * Canonical discriminated model for select-related field `inputConfig` (admin metadata wire shape).
 * WHY: Single place for variants; `targetMode: 'property'` is forbidden (use `primitive`).
 */

/** Wire keys preserved across primitive metadata edits (not owned by inputConfigEditor form). */
export const SELECT_INPUT_CONFIG_PASSTHROUGH_KEYS = [
  'selectType',
  'globalField',
  'selectedChildPath',
  'candidateChildPath',
  'candidateParentPath',
  'selectedChildKey',
  'selectedParentKey',
  'candidateParentKey',
  'modeToggle',
  'dependencyImpact',
] as const

export type SelectInputConfigPassthroughKey = (typeof SELECT_INPUT_CONFIG_PASSTHROUGH_KEYS)[number]

export type SelectInputConfigPassthrough = Partial<
  Record<SelectInputConfigPassthroughKey, unknown>
>

export type SelectInputStaticOptionsCore = {
  kind: 'staticOptions'
  options: unknown[]
  selectMode?: string
}

export type SelectInputRelationshipCore = {
  kind: 'relationship'
  /** Flat wire fields except `kind`; always includes targetMode: 'relationship'. */
  wire: Record<string, unknown>
}

export type SelectInputPrimitiveCore = {
  kind: 'primitive'
  /** Flat wire fields except `kind`; always includes targetMode: 'primitive'. */
  wire: Record<string, unknown>
}

export type SelectInputConfig =
  | SelectInputStaticOptionsCore
  | SelectInputRelationshipCore
  | SelectInputPrimitiveCore

export type ParsedSelectInputConfig = {
  core: SelectInputConfig | null
  passthrough: SelectInputConfigPassthrough
  /**
   * Wire keys neither modeled as `core` nor listed in passthrough (partial saves, unknown extensions).
   * WHY: Admin editor can persist `selectMode` before `targetMode`; must round-trip without loss.
   */
  opaque: Record<string, unknown>
}

export class ForbiddenSelectInputTargetModeError extends Error {
  readonly code = 'FORBIDDEN_SELECT_INPUT_TARGET_MODE_PROPERTY' as const

  constructor(message = 'inputConfig.targetMode "property" is forbidden; use "primitive" for type selects.') {
    super(message)
    this.name = 'ForbiddenSelectInputTargetModeError'
  }
}
