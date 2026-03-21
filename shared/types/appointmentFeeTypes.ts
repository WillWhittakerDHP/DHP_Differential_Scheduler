/**
 * Shared Appointment Fee Types
 *
 * WHY: Single source of truth for fee summary/entry interfaces; maps to normalized tables
 * PATTERN: Shared types directory for cross-cutting concerns
 *
 * Phase 1: Normalized fee storage (appointment_fee_summaries + appointment_fee_entries)
 */

/**
 * Appointment-level fee summary (maps to appointment_fee_summaries row)
 * WHY: Enables fast income constraint queries (SUM total_fee) and auditability
 * PATTERN: 1:1 with appointment, like property_versions
 */
export interface AppointmentFeeSummary {
  id: string
  appointmentId: string
  baseFeeTotal: number
  overageFeeTotal: number
  totalFee: number
  squareFootage: number
  aduCount: number
  currency: string
  calculatedAt: string // RFC3339
}

/**
 * Minimal fee shape (base, overage, total).
 * WHY: BlockInstanceFeeResult, AppointmentFeeEntry extend or align (TYPE_SIMILARITY_PROPOSAL § 1.9).
 */
export interface FeeEntryBase {
  baseFee: number
  overageFee: number
  totalFee: number
}

/**
 * Per-block fee entry (maps to appointment_fee_entries row)
 * WHY: Enables per-block revenue analytics, invoicing, dispute resolution
 * PATTERN: Many:1 with fee summary, like part_instance_versions to block_instance_versions
 */
export interface AppointmentFeeEntry extends FeeEntryBase {
  id: string
  feeSummaryId: string
  blockInstanceId: string // Soft ref (no FK) — allows instance deletion
  blockName: string // Denormalized for display
  blockShapeRef: string // For grouping by block type (service, property, option, lineItem)
  quantity: number // 1 for normal blocks, aduCount for allowMultiple
}

/**
 * Payload for creating a fee summary (omits id, appointmentId — server assigns)
 * PATTERN: Omit server-assigned fields from creation payload
 */
export type AppointmentFeeSummaryCreate = Omit<
  AppointmentFeeSummary,
  'id' | 'appointmentId'
>

/**
 * Payload for creating a fee entry (omits id, feeSummaryId — server assigns)
 * PATTERN: Omit server-assigned fields from creation payload
 */
export type AppointmentFeeEntryCreate = Omit<
  AppointmentFeeEntry,
  'id' | 'feeSummaryId'
>

/**
 * Fee breakdown payload sent with appointment creation
 * PATTERN: Summary + array of entries, same shape as normalized tables
 */
export interface AppointmentFeeBreakdownPayload {
  summary: AppointmentFeeSummaryCreate
  entries: AppointmentFeeEntryCreate[]
}
