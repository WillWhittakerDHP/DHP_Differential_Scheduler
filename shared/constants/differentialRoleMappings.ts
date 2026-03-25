import type { DifferentialRole } from '../types/differentialRole'

/** Admin / UI labels for each role (including none). */
export const DIFFERENTIAL_ROLE_LABELS: Record<DifferentialRole, string> = {
  major: 'Major',
  minor: 'Minor',
  minimizer: 'Minimizer',
  margin: 'Margin',
  none: 'None',
}

/** Admin select / API: null means none in DB. */
export const DIFFERENTIAL_ROLE_SELECT_OPTIONS: ReadonlyArray<{ value: string | null; label: string }> = [
  { value: null, label: DIFFERENTIAL_ROLE_LABELS.none },
  { value: 'major', label: DIFFERENTIAL_ROLE_LABELS.major },
  { value: 'minor', label: DIFFERENTIAL_ROLE_LABELS.minor },
  { value: 'minimizer', label: DIFFERENTIAL_ROLE_LABELS.minimizer },
  { value: 'margin', label: DIFFERENTIAL_ROLE_LABELS.margin },
]
