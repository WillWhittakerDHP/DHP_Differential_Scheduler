/**
 * Composable for AppointmentConfirmationPanel: hold duration and admin entry time-out
 * logic (clamp, validation rule, handlers). Extracted per vue-architecture audit to keep
 * the component thin and reduce local function count.
 */
import { computed, type ComputedRef } from 'vue'
import type { AppointmentConfirmationPanelModel } from '@/types/admin/appointmentConfirmationPanel'

/** Props wrapper: composable reads fields from `panelModel`. */
interface ConfirmationAndHoldsPanelProps {
  panelModel: AppointmentConfirmationPanelModel
}

type ConfirmationAndHoldsPanelEmit = {
  (e: 'update:holdDurationMinutes', value: number): void
  (e: 'update:holdDurationMin', value: number): void
  (e: 'update:holdDurationMax', value: number): void
  (e: 'update:holdDurationFallback', value: number): void
  (e: 'update:autoConfirmEnabled', value: boolean): void
  (e: 'update:adminEntryTimeoutValue', value: number): void
  (e: 'update:adminEntryTimeoutUnit', value: 'days' | 'weeks'): void
}

export interface UseConfirmationAndHoldsPanelReturn {
  holdDurationHintText: ComputedRef<string>
  holdDurationRule: (value: unknown) => true | string
  handleAutoConfirmUpdate: (v: boolean | null) => void
  handleHoldDurationMinutes: (v: string | number) => void
  handleHoldDurationMin: (v: string | number) => void
  handleHoldDurationMax: (v: string | number) => void
  handleHoldDurationFallback: (v: string | number) => void
  handleAdminEntryTimeoutValue: (v: string | number) => void
  handleAdminEntryTimeoutUnit: (v: 'days' | 'weeks') => void
}

function clampHoldDuration(
  value: number,
  fallback: number,
  min: number,
  max: number
): number {
  const n = Number.isNaN(value) ? fallback : Math.floor(value)
  return Math.min(max, Math.max(min, n))
}

function clampAdminEntryTimeout(value: number): number {
  const n = Math.floor(Number(value))
  return Number.isNaN(n) || n < 1 ? 1 : Math.min(365, n)
}

/**
 * Hold duration and admin entry time-out logic for Confirmation & Holds panel.
 * Use in AppointmentConfirmationPanel to keep component thin (vue-architecture).
 */
export function useConfirmationAndHoldsPanel(
  props: ConfirmationAndHoldsPanelProps,
  emit: ConfirmationAndHoldsPanelEmit
): UseConfirmationAndHoldsPanelReturn {
  const holdDurationHintText = computed(
    () =>
      `How long a slot is held before it expires. Allowed range: ${props.panelModel.holdDurationMin}–${props.panelModel.holdDurationMax} minutes.`
  )

  function holdDurationRule(value: unknown): true | string {
    const n = Number(value)
    const { holdDurationMin: min, holdDurationMax: max } = props.panelModel
    if (Number.isNaN(n)) return `Hold duration must be at least ${min} minute(s).`
    if (n < min) return `Hold duration must be at least ${min} minute(s).`
    if (n > max) return `Hold duration cannot exceed ${max} minutes.`
    return true
  }

  function handleAutoConfirmUpdate(v: boolean | null): void {
    emit('update:autoConfirmEnabled', v === true)
  }

  function handleHoldDurationMinutes(v: string | number): void {
    const m = props.panelModel
    emit(
      'update:holdDurationMinutes',
      clampHoldDuration(Number(v), m.holdDurationFallback, m.holdDurationMin, m.holdDurationMax)
    )
  }

  function handleHoldDurationMin(v: string | number): void {
    emit('update:holdDurationMin', Math.max(1, Math.floor(Number(v)) || 1))
  }

  function handleHoldDurationMax(v: string | number): void {
    emit('update:holdDurationMax', Math.min(1440, Math.floor(Number(v)) || 60))
  }

  function handleHoldDurationFallback(v: string | number): void {
    const m = props.panelModel
    emit(
      'update:holdDurationFallback',
      clampHoldDuration(Number(v), m.holdDurationFallback, m.holdDurationMin, m.holdDurationMax)
    )
  }

  function handleAdminEntryTimeoutValue(v: string | number): void {
    emit('update:adminEntryTimeoutValue', clampAdminEntryTimeout(Number(v)))
  }

  function handleAdminEntryTimeoutUnit(v: 'days' | 'weeks'): void {
    emit('update:adminEntryTimeoutUnit', v)
  }

  return {
    holdDurationHintText,
    holdDurationRule,
    handleAutoConfirmUpdate,
    handleHoldDurationMinutes,
    handleHoldDurationMin,
    handleHoldDurationMax,
    handleHoldDurationFallback,
    handleAdminEntryTimeoutValue,
    handleAdminEntryTimeoutUnit,
  }
}
