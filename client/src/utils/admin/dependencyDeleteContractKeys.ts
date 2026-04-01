/**
 * Client mirror of server dependency-delete contract registration.
 * WHY: List/card entry points branch to AdminEntityDeleteWizard only for these keys.
 * SYNC: Keep aligned with `server/src/services/entityDelete/dependencyDeleteRegistry.ts`.
 */

import type { GlobalEntityKey } from '@/constants/entities'

export const DEPENDENCY_DELETE_CONTRACT_ENTITY_KEYS: readonly GlobalEntityKey[] = ['partShape']

export function usesDependencyDeleteContract(entityKey: GlobalEntityKey): boolean {
  return DEPENDENCY_DELETE_CONTRACT_ENTITY_KEYS.includes(entityKey)
}
