import type { ContingencyPeriod } from '@/types/minimizerScheduling'

export const DEFAULT_CONTINGENCY: ContingencyPeriod = {
  hasContingency: null,
  endDate: null,
  endTime: null,
}

export const DEFAULT_OUTER_BOUNDARY_DAYS = 3
