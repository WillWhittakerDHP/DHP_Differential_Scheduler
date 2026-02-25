/**
 * WHY: Clean up active relationships when a parent's valid children change (e.g. validCascades, validParts).
 * When the user changes which children are valid, any affected entity that references an no-longer-valid child
 * has that relationship removed via API and queries invalidated.
 */
import type { QueryClient } from '@tanstack/vue-query'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { useAdmin } from '@/composables/admin/useAdmin'
import apiClient from '@/utils/api'
import { getRelationshipByParentChildEndpoint } from '@/utils/api'

interface DependencyImpact {
  affectedEntityKey: GlobalEntityKey
  affectedField: string
  linkingField: string
}

export async function cleanupInvalidActiveRelationships(
  entityKey: GlobalEntityKey,
  entityId: string,
  relationshipKey: GlobalRelationshipKey,
  newValidChildIds: GlobalEntityId[],
  queryClient: QueryClient
): Promise<void> {
  const { getFormFieldConfig } = useAdminConfig()
  const configRef = getFormFieldConfig(entityKey, relationshipKey as Parameters<typeof getFormFieldConfig>[1])
  const config = configRef?.value
  const dependencyImpact = (config as { relationshipSelect?: { dependencyImpact?: DependencyImpact } })?.relationshipSelect?.dependencyImpact
  if (!dependencyImpact) {
    return
  }

  const { getEntitiesByKey, getEntity } = useAdmin()
  const validSet = new Set(newValidChildIds.map(String))
  const { affectedEntityKey, affectedField, linkingField } = dependencyImpact
  // Child entity key: partAssignments links to partInstance; bookingCascades links to blockInstance
  const childEntityKey: GlobalEntityKey =
    affectedField === 'partAssignments' ? 'partInstance' : affectedEntityKey

  const allAffected = getEntitiesByKey(affectedEntityKey)
  const affectedEntities = allAffected.filter(
    (e: Record<string, unknown>) => String(e[linkingField] ?? '') === entityId
  )

  const deletePromises: Promise<void>[] = []
  for (const parent of affectedEntities) {
    const parentId = String((parent as { id?: string }).id ?? '')
    const childIds = (parent[affectedField] as unknown[] | undefined) ?? []
    if (!Array.isArray(childIds)) continue
    for (const childId of childIds) {
      const cid = String(childId)
      const child = getEntity(childEntityKey, cid) as Record<string, unknown> | undefined | null
      const linkValue = child ? String(child[linkingField] ?? '') : ''
      const stillValid = linkValue !== '' && validSet.has(linkValue)
      if (!stillValid) {
        const endpoint = getRelationshipByParentChildEndpoint(affectedField, parentId, cid)
        deletePromises.push(apiClient.delete(endpoint).then(() => void 0))
      }
    }
  }

  await Promise.all(
    deletePromises.map((p) => p.catch((err: unknown) => {
      // Log but do not rethrow so one failed delete does not fail the whole cleanup
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('dependencyCleanup: delete failed', err)
      }
    }))
  )

  const queryKeysToInvalidate: unknown[][] = [['globalData'], [affectedEntityKey]]
  if (affectedField === 'bookingCascades') {
    queryKeysToInvalidate.push(['bookingCascades'])
  }
  if (affectedEntityKey === 'blockInstance') {
    queryKeysToInvalidate.push(['blockInstance'])
  }
  await Promise.all(
    queryKeysToInvalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
  )
}
