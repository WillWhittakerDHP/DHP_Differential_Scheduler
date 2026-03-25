/**
 * Shared optional copy/labels for wizard + availability differential UI.
 * WHY: Same field names in wizard_settings JSON and availability form state (type-similarity EXTEND).
 */
export interface WizardCopyLabelFields {
  majorLabel?: string
  minorLabel?: string
  minimizerFallbackLabel?: string
  differentialGraphDefaultLabel?: string
  majorStateLabel?: string
  minorStateLabel?: string
  subStepLabelPickDay?: string
  subStepLabelOptions?: string
  subStepLabelPickTime?: string
  subStepLabelConfirmMinimizer?: string
  /** Booking wizard: when Yes+deadline minimizer grid has no completion slots after load. */
  minimizerNoFeasibleCompletionSlotsMessage?: string
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
  /**
   * Quote mode OKLCH tweak: fraction of full hue circle rotated clockwise (0–1). Default 0.2 (= 20%).
   */
  brandQuoteHueCircleFraction?: number | null
  /** Quote mode: chroma multiplier vs anchors (e.g. 0.8 = 20% less saturated). Default 0.8. */
  brandQuoteChromaFactor?: number | null
  /**
   * Reschedule mode: fraction of full hue circle rotated counter-clockwise (0–1). Default 0.2.
   */
  brandRescheduleHueCircleFraction?: number | null
  /** Reschedule mode: chroma multiplier (e.g. 1.2 = 20% more saturated). Default 1.2. */
  brandRescheduleChromaFactor?: number | null
  /**
   * Warning slot: extra OKLCH tweak on top of mode-adjusted secondary (clockwise hue, 0–1 of circle). Default 0.
   */
  brandWarningHueCircleFraction?: number | null
  /** Warning: chroma multiplier vs mode-adjusted secondary. Default 1. */
  brandWarningChromaFactor?: number | null
  /**
   * Booking selection cards: ms to wait before showing CARD_TOOLTIP overlay on hover.
   * Omit or invalid → client default (3000).
   */
  selectionCardTooltipOpenDelayMs?: number
}
