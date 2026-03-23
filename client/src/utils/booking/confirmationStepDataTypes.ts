import type { DriveTimeFeeConfig } from '@shared/types/availabilityTypes'

/** Passed from availability step when a slot is selected (task 6.11.1.3+). */
export interface ConfirmationDriveContext {
  totalDriveMinutes: number
}

/** Optional drive row for persisted fee breakdown (Phase 6.11.5). */
export interface AppointmentFeeBreakdownDriveOptions {
  driveContext?: ConfirmationDriveContext | null
  driveTimeFeeSettings?: DriveTimeFeeConfig | null
  driveTimeSystemBlock?: { blockInstanceId: string; blockShapeRef: string } | null
}
