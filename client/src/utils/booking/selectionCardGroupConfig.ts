import type { SelectionCardConfig } from '@/components/booking/types/selectionCardTypes'

export function shouldUseSelectionGroupWrapper(config: SelectionCardConfig): boolean {
  return config.selectionGroup !== 'none'
}

export function getSelectionGroupComponentName(config: SelectionCardConfig): string {
  return config.selectionGroup || 'VRadioGroup'
}

export function buildSelectionCardGridColumnProps(config: SelectionCardConfig): Record<string, string | number> {
  const cols = config.gridColumns || {}
  const result: Record<string, string | number> = {}

  if (cols.cols !== undefined) result.cols = cols.cols
  if (cols.sm !== undefined) result.sm = cols.sm
  if (cols.md !== undefined) result.md = cols.md
  if (cols.lg !== undefined) result.lg = cols.lg
  if (cols.xl !== undefined) result.xl = cols.xl

  return result
}


