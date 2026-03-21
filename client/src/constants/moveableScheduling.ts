import type { ContingencyPeriod } from '@/types/moveableScheduling'

export const DEFAULT_CONTINGENCY: ContingencyPeriod = {
  hasContingency: false,
  endDate: null,
  endTime: null,
}

export const DEFAULT_OUTER_BOUNDARY_DAYS = 3
