/**
 * When the user changes which children are valid, any affected entity that references an no-longer-valid child
 * has that relationship removed via API and queries invalidated.
 */
import type { QueryClient } from '@tanstack/vue-query'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { DependencyImpactBase } from '@/types/entity/formFields'
import { useAdminConfig } from '@/composables/useAdminConfig'
import { useAdmin } from '@/composables/admin/useAdmin'
import apiClient from '@/utils/api'
import { getRelationshipByParentChildEndpoint } from '@/utils/api'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { createLogger } from '@/utils/logger'

const logger = createLogger('dependencyCleanup')

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
  const dependencyImpact = (config as { relationshipSelect?: { dependencyImpact?: DependencyImpactBase } })?.relationshipSelect?.dependencyImpact
  if (!dependencyImpact) {
    return
  }

  const { getEntitiesByKey, getEntity } = useAdmin()
  const validSet = new Set(newValidChildIds.map(String))
  const { affectedEntityKey, affectedField, linkingField } = dependencyImpact
  const childEntityKey: GlobalEntityKey =
    affectedField === 'partAssignments' ? 'partInstance' : affectedEntityKey

  const allAffected = getEntitiesByKey(affectedEntityKey)
  const affectedEntities = allAffected.filter(
    (e: Record<string, unknown>) => (e[linkingField] != null ? String(e[linkingField]) : '') === entityId
  )

  const deletePromises: Promise<void>[] = []
  for (const parent of affectedEntities) {
    const parentId = (parent as { id?: string }).id != null ? String((parent as { id: string }).id) : ''
    const raw = parent[affectedField]
    const childIds = Array.isArray(raw) ? raw : []
    for (const childId of childIds) {
      const cid = String(childId)
      const child = getEntity(childEntityKey, toGlobalEntityId(cid)) as Record<string, unknown> | undefined | null
      const linkValue = child && child[linkingField] != null ? String(child[linkingField]) : ''
      const stillValid = linkValue !== '' && validSet.has(linkValue)
      if (!stillValid) {
        const endpoint = getRelationshipByParentChildEndpoint(affectedField, parentId, cid)
        deletePromises.push(apiClient.delete(endpoint).then(() => void 0))
      }
    }
  }

  await Promise.all(
    deletePromises.map((p) => p.catch((err: unknown) => {
      logger.warn('delete failed', { err })
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
