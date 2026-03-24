/**
 * Open delay for annotation card tooltips on selection cards.
 * WHY: Admin-configurable via wizard_settings JSON; default avoids instant tooltip spam while browsing cards.
 */
import { computed, type ComputedRef } from 'vue'
import type { WizardSettingsData } from '@/configs/wizardSettings'
import { useBookingWizardSettingsSingleton } from '@/composables/booking/useBookingWizardSettingsSingleton'

const DEFAULT_SELECTION_CARD_TOOLTIP_OPEN_DELAY_MS = 3000

/** Read delay from wizard payload (camelCase or legacy snake_case). */
function pickSelectionCardTooltipOpenDelayMsRaw(data: WizardSettingsData | null | undefined): unknown {
  if (data == null) {
    return undefined
  }
  const o = data as Record<string, unknown>
  const camel = o.selectionCardTooltipOpenDelayMs
  if (camel != null) {
    return camel
  }
  return o.selection_card_tooltip_open_delay_ms
}

/** Normalize API / form values (number or numeric string); invalid → default. */
function parseSelectionCardTooltipOpenDelayMs(raw: unknown): number {
  if (raw == null) {
    return DEFAULT_SELECTION_CARD_TOOLTIP_OPEN_DELAY_MS
  }
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw.trim()) : NaN
  if (!Number.isFinite(n)) {
    return DEFAULT_SELECTION_CARD_TOOLTIP_OPEN_DELAY_MS
  }
  return Math.max(0, Math.floor(n))
}

export function useSelectionCardAnnotationTooltipOpenDelayMs(): ComputedRef<number> {
  const { wizardData } = useBookingWizardSettingsSingleton()
  return computed(() =>
    parseSelectionCardTooltipOpenDelayMs(pickSelectionCardTooltipOpenDelayMsRaw(wizardData.value ?? undefined))
  )
}
