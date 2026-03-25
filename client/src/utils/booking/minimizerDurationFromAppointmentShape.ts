/**
 * Pure: minimizer part rounded duration from built appointment shape (same rules as useMinimizerPartsScheduling).
 */
import type { AppointmentShape } from '@/types/appointment'
import { sumMinimizerSegmentsRoundedDurationMinutes } from '@/utils/booking/minimizerEventShapes'

export function getMinimizerRoundedDurationMinutesFromAppointmentShape(
  shape: AppointmentShape | null
): number {
  return sumMinimizerSegmentsRoundedDurationMinutes(shape)
}
