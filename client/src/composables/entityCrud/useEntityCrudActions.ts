import type { GlobalEntityKey } from '@/constants/entities'
import type { Logger } from '@/utils/logger'
import { useEntityCrudState } from './useEntityCrudState'
import { useEntityCrudMutations } from './useEntityCrudMutations'
import type { UseEntityCrudActionsReturn } from './useEntityCrudTypes'

/**
 * Actions/mutations module for `useEntityCrud`.
 *
 * PATTERN: query/state/actions separation
 * - state reads from globalData cache (see `useEntityCrudState`)
 * - actions are Vue Query mutations (see `useEntityCrudMutations`)
 */
export function useEntityCrudActions<GlobalEntityTypeKey extends GlobalEntityKey>(params: {
  entityKey: GlobalEntityTypeKey
  logger: Logger
}): UseEntityCrudActionsReturn<GlobalEntityTypeKey> {
  const { entityKey, logger } = params

  const state = useEntityCrudState()
  const mutations = useEntityCrudMutations({ entityKey, logger })

  return {
    ...state,
    ...mutations,
  }
}
