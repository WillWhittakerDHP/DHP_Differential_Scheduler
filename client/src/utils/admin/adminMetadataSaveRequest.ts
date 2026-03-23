/**
 * WHY: POST body assembly for save field metadata (useAdminMetadataMutations length audit).
 */

import apiClient, { getAdminMetadataEndpoint } from '@/utils/api'
import { buildMetadataEntry } from '@/utils/admin/buildMetadataEntry'
import { RELATIONSHIP_KEYS } from '@/constants/relationships'
import { createLogger } from '@/utils/logger'
import type { SaveFieldMetadataMutationVariables } from '@/types/admin/fieldMetadataMutationVariables'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'

const logger = createLogger('adminMetadataSaveRequest')

export async function postSaveFieldMetadataRequest(
  variables: SaveFieldMetadataMutationVariables,
  resolveExistingMetadata: (
    entityType: string,
    fieldKey: string,
    blockShapeRef: string | null | undefined
  ) => FieldMetadataEntry | undefined
): Promise<unknown> {
  const {
    entityType,
    entityId,
    fieldKey,
    renderingUpdates,
    existingMetadata: incomingExisting,
    blockShapeRef,
  } = variables

  let existingMetadata = incomingExisting
  if (!existingMetadata) {
    existingMetadata = resolveExistingMetadata(entityType, fieldKey, blockShapeRef ?? undefined)
  }

  if (!existingMetadata) {
    throw new Error(
      `[useAdminMetadataMutations] Missing existingMetadata for ${entityType}.${fieldKey}. ` +
        `Cannot create new metadata entry without canonical fields. ` +
        `Fields must be configured in /admin-metadata before updating rendering config.`
    )
  }

  const isRelationship = fieldKey in RELATIONSHIP_KEYS

  const fullEntry = {
    ...buildMetadataEntry({
      key: fieldKey,
      renderingUpdates,
      existingMetadata,
      isRelationship,
    }),
    fieldKey,
    blockShapeRef: blockShapeRef || null,
  } as { fieldKey: string; blockShapeRef: string | null } & Record<string, unknown>

  const endpoint = getAdminMetadataEndpoint(entityType, entityId)

  logger.debug('Saving metadata:', {
    endpoint,
    entityType,
    entityId,
    fieldKey,
    blockShapeRef: blockShapeRef || null,
    fullEntry,
    hasExistingMetadata: !!existingMetadata,
    isRelationship,
  })

  const response = await apiClient.post(endpoint, fullEntry)

  logger.debug('Save response:', response.data)

  return response.data
}
