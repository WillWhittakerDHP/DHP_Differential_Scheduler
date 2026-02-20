/**
 * Canonical "has id" shape; id is branded so entity ids and config ids are not mixed.
 */
import type { GlobalEntityId } from './primitiveBrands'

export interface IdentifiableById {
  id: GlobalEntityId
}
