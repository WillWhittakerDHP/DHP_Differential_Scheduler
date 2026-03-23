/**
 */
import { runBooleanInputClick, type BooleanInputClickDeps } from '@/utils/admin/booleanInputClickHandler'

export function useBooleanInputClick(params: BooleanInputClickDeps): (event: Event) => Promise<void> {
  return (event: Event) => runBooleanInputClick(event, params)
}
