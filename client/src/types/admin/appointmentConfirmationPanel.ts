/** V-model-style fields for AppointmentConfirmationPanel (single prop for prop-count governance). */
export interface AppointmentConfirmationPanelModel {
  holdDurationMinutes: number
  autoConfirmEnabled: boolean
  adminEntryTimeoutValue: number
  adminEntryTimeoutUnit: 'days' | 'weeks'
  holdDurationMin: number
  holdDurationMax: number
  holdDurationFallback: number
}
