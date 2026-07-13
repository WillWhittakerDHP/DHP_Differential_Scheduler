/**
 * Wizard placement (Phase B): a single 4-state control on each block instance that
 * replaces the old `wizardVisible` boolean.
 *
 * WHY: A boolean could only say "in the wizard" vs "not in the wizard", which collapsed
 * three distinct intents (top-line card, sub-option/add-on, and both) into one and lost
 * the "hidden entirely" case. This enum makes the admin's intent explicit and drives the
 * booking pipeline's main-pool vs line-item split.
 *
 * States:
 * - hidden     — never shown in the wizard (e.g. orchestrator/user blocks like "Inspector").
 * - topLine    — shown as a top-line wizard card (the old `wizardVisible = true`).
 * - subOption  — shown only as a nested sub-option / add-on line item (the old `wizardVisible = false`).
 * - both       — shown as a top-line card AND available as a sub-option.
 *
 * PATTERN: Mirrors `eventPlacementUtils.ts` — a shared enum + type guards + input sanitizer,
 * importable by both client (`@shared/constants/wizardPlacement`) and server.
 */

export const WIZARD_PLACEMENT = {
  HIDDEN: 'hidden',
  TOP_LINE: 'topLine',
  SUB_OPTION: 'subOption',
  BOTH: 'both',
} as const

export type WizardPlacement = (typeof WIZARD_PLACEMENT)[keyof typeof WIZARD_PLACEMENT]

export const WIZARD_PLACEMENT_VALUES: readonly WizardPlacement[] = [
  WIZARD_PLACEMENT.HIDDEN,
  WIZARD_PLACEMENT.TOP_LINE,
  WIZARD_PLACEMENT.SUB_OPTION,
  WIZARD_PLACEMENT.BOTH,
]

/** Default when a placement is absent — instances are top-line unless told otherwise. */
export const DEFAULT_WIZARD_PLACEMENT: WizardPlacement = WIZARD_PLACEMENT.TOP_LINE

const PLACEMENT_SET = new Set<string>(WIZARD_PLACEMENT_VALUES)

export function isWizardPlacement(value: unknown): value is WizardPlacement {
  return typeof value === 'string' && PLACEMENT_SET.has(value)
}

/**
 * Coalesce any stored/legacy value into a concrete placement.
 * WHY: During and after the migration, values may arrive as a real placement, as the old
 * boolean (`true`/`false` or their string forms), or as undefined/null (API omit → default).
 * - `false` / `'false'` → subOption (old "add-on only").
 * - everything else non-placement (`true`, undefined, null, '') → default top-line.
 */
export function resolveWizardPlacement(raw: unknown): WizardPlacement {
  if (isWizardPlacement(raw)) {
    return raw
  }
  if (raw === false || raw === 'false') {
    return WIZARD_PLACEMENT.SUB_OPTION
  }
  return DEFAULT_WIZARD_PLACEMENT
}

/** API/body sanitizer: returns null when the value is not a valid placement (caller may treat as omit). */
export function sanitizeWizardPlacementInput(raw: unknown): WizardPlacement | null {
  if (raw === undefined || raw === null || raw === '') {
    return null
  }
  return isWizardPlacement(raw) ? raw : null
}

/** True when the instance appears as a top-line wizard card (topLine or both; undefined defaults to top-line). */
export function isWizardTopLine(placement: unknown): boolean {
  const p = resolveWizardPlacement(placement)
  return p === WIZARD_PLACEMENT.TOP_LINE || p === WIZARD_PLACEMENT.BOTH
}

/** True when the instance appears as a nested sub-option / add-on line item (subOption or both). */
export function isWizardSubOption(placement: unknown): boolean {
  const p = resolveWizardPlacement(placement)
  return p === WIZARD_PLACEMENT.SUB_OPTION || p === WIZARD_PLACEMENT.BOTH
}

/** True only when explicitly hidden from the wizard in every form. */
export function isWizardHidden(placement: unknown): boolean {
  return placement === WIZARD_PLACEMENT.HIDDEN
}

/**
 * Advance to the next placement in a fixed loop for click-through UI (the admin title-row button).
 * WHY: The admin control cycles through states on click (like the boolean status buttons), so the
 * order must be a single, predictable ring. Order follows WIZARD_PLACEMENT_VALUES:
 * hidden → topLine → subOption → both → hidden.
 */
export function cycleWizardPlacement(current: unknown): WizardPlacement {
  const resolved = resolveWizardPlacement(current)
  const index = WIZARD_PLACEMENT_VALUES.indexOf(resolved)
  const nextIndex = (index + 1) % WIZARD_PLACEMENT_VALUES.length
  return WIZARD_PLACEMENT_VALUES[nextIndex]
}
