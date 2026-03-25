import type { RFC3339DateTime } from '@shared/types/primitiveBrands'

/**
 * Client-only allowed window for minimizer completion slots (transient, per booking).
 * Not sent to the server; derived from inspection inner boundary, buffer, and optional contingency end.
 */
export interface MinimizerSchedulingWindow {
  earliestStart: RFC3339DateTime
  /** Present only when user set a contingency deadline; used to drop slots that end after the deadline. */
  latestEnd: RFC3339DateTime | null
}
