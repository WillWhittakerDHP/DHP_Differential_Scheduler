import type { DifferentialRole } from '../types/differentialRole'

/** Admin / UI labels for each role (including none). */
export const DIFFERENTIAL_ROLE_LABELS: Record<DifferentialRole, string> = {
  major: 'Major',
  minor: 'Minor',
  minimizer: 'Minimizer',
  margin: 'Margin',
  none: 'None',
}
