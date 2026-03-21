import type { UseFieldContextStateOptions } from '@/types/fieldContext/fieldContextState'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { FieldContextTypeGrouped } from './types'
import { buildFieldContextReturn } from './buildFieldContextReturn'
import { useFieldContextState } from './useFieldContextState'

/**
 * PATTERN: Field context composable (facade); single composable dependency (useFieldContextState).
 * Returns grouped { state, actions } for composable-health (oversized-return repair).
 */
export function useFieldContext<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  fieldKey: FieldKey,
  entityKey: GE,
  entityId: GlobalEntityId,
  options?: UseFieldContextStateOptions<GE, FieldKey>
): FieldContextTypeGrouped<GE, FieldKey> {
  const stateAndActions = useFieldContextState(fieldKey, entityKey, entityId, options)
  return buildFieldContextReturn(stateAndActions)
}


