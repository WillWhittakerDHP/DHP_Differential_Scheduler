/**
 * Canonical list of registered annotation UI slots.
 *
 * WHY: Single source for client (wizard rendering, admin dropdown) and server (annotation_shapes.ui_slot validation).
 * Annotation shapes can optionally set a ui_slot from this registry; the wizard only renders content for known slots.
 * Admins create annotation shapes and assign a slot from the dropdown (or leave null for admin-only / free-form).
 *
 * PATTERN: Shared registry constant like EVENT_TEMPLATE_VARIABLES and BLOCK_SHAPE_TYPES — same const on frontend
 * and backend for consistency. The DB column annotation_shapes.ui_slot stores one of these values or null.
 */
export const ANNOTATION_UI_SLOTS = {
  CARD_DESCRIPTION: 'cardDescription',
  CARD_TOOLTIP: 'cardTooltip',
  CARD_COLOR_LABEL: 'cardColorLabel',
  SECTION_HEADER: 'sectionHeader',
  GRID_OVERLAY: 'gridOverlay',
  CONFIRMATION_NOTE: 'confirmationNote',
  VALIDATION_MESSAGE: 'validationMessage',
} as const

export type AnnotationUiSlot =
  (typeof ANNOTATION_UI_SLOTS)[keyof typeof ANNOTATION_UI_SLOTS]

/**
 * Registry metadata for each slot: label and description for admin UI, renderTarget and attachesTo for
 * documentation and future validation. Admin dropdown options and wizard slot resolution use this.
 */
export const ANNOTATION_UI_SLOT_REGISTRY = [
  {
    slot: ANNOTATION_UI_SLOTS.CARD_DESCRIPTION,
    label: 'Card Description',
    description: 'Subtitle text below the item name in selection cards',
    renderTarget: 'SelectionCard',
    attachesTo: ['blockInstance'],
  },
  {
    slot: ANNOTATION_UI_SLOTS.CARD_TOOLTIP,
    label: 'Card Tooltip',
    description: 'Hover tooltip or info icon on selection cards',
    renderTarget: 'SelectionCard',
    attachesTo: ['blockInstance'],
  },
  {
    slot: ANNOTATION_UI_SLOTS.CARD_COLOR_LABEL,
    label: 'Color Label',
    description: 'Colored badge/chip on selection cards',
    renderTarget: 'SelectionCard',
    attachesTo: ['blockInstance'],
  },
  {
    slot: ANNOTATION_UI_SLOTS.SECTION_HEADER,
    label: 'Section Header',
    description: 'Introductory text above a selection card group',
    renderTarget: 'SelectionCardGroup',
    attachesTo: ['blockShape'],
  },
  {
    slot: ANNOTATION_UI_SLOTS.GRID_OVERLAY,
    label: 'Grid Overlay',
    description: 'Overlay text on the appointment slot grid',
    renderTarget: 'AvailabilityStep',
    attachesTo: ['eventShape'],
  },
  {
    slot: ANNOTATION_UI_SLOTS.CONFIRMATION_NOTE,
    label: 'Confirmation Note',
    description: 'Note text shown on the confirmation step',
    renderTarget: 'ConfirmationStep',
    attachesTo: ['blockInstance', 'eventShape'],
  },
  {
    slot: ANNOTATION_UI_SLOTS.VALIDATION_MESSAGE,
    label: 'Validation Message',
    description: 'Error/warning message for business rule violations',
    renderTarget: 'BusinessRule',
    attachesTo: ['blockInstance'],
  },
] as const

/** Runtime list of allowed slot string values (for server/client validation). */
export const ANNOTATION_UI_SLOT_VALUES: readonly AnnotationUiSlot[] = ANNOTATION_UI_SLOT_REGISTRY.map(
  (entry) => entry.slot
)

export function isAnnotationUiSlot(value: string): value is AnnotationUiSlot {
  return (ANNOTATION_UI_SLOT_VALUES as readonly string[]).includes(value)
}

/**
 * Normalize API/DB input: empty string → null; unknown non-empty string → invalid (caller should reject).
 */
export function parseAnnotationUiSlotInput(raw: unknown): string | null {
  if (raw === null || raw === undefined) {
    return null
  }
  if (typeof raw !== 'string') {
    return null
  }
  const t = raw.trim()
  if (t.length === 0) {
    return null
  }
  return t
}
