/**
 * Shared optional copy/labels for wizard + availability differential UI.
 * WHY: Same field names in wizard_settings JSON and availability form state (type-similarity EXTEND).
 */
export interface WizardCopyLabelFields {
  majorLabel?: string
  minorLabel?: string
  moveableFallbackLabel?: string
  differentialGraphDefaultLabel?: string
  majorStateLabel?: string
  minorStateLabel?: string
  subStepLabelPickDay?: string
  subStepLabelOptions?: string
  subStepLabelPickTime?: string
  subStepLabelConfirmMoveable?: string
  /** Booking wizard: when Yes+deadline moveable grid has no completion slots after load. */
  moveableNoFeasibleCompletionSlotsMessage?: string
}

/** Singleton wizard display config (stored as one JSON document). */
export interface WizardSettingsData extends WizardCopyLabelFields {
  showApplyCoupon?: boolean
  useBrandColors?: boolean
  selectTimeSlotLabel?: string
  /** Primary brand anchor hex (e.g. #RRGGBB or RRGGBB), nullable when unset. */
  brandPrimaryHex?: string | null
  /** Secondary brand anchor hex, nullable when unset. */
  brandSecondaryHex?: string | null
  /** Public URL or path to uploaded wizard logo, nullable when unset. */
  logoUrl?: string | null
}
