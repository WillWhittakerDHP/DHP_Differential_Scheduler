import { TEMPORARY_ID_PATTERNS } from '@/constants/entityFieldConstants'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'

export function isTemporaryMetadataEntityId(entityIdStr: string): boolean {
  return entityIdStr.startsWith(TEMPORARY_ID_PATTERNS.NEW_PREFIX)
}

export function buildTemporaryMetadataEntityStub<GE extends GlobalEntityKey>(
  entityKey: GE,
  entityId: unknown,
  formValues: Record<string, unknown>
): GlobalEntity<GE> {
  const entity: Record<string, unknown> = {
    id: entityId,
    entityKey,
  }
  if (entityKey === 'blockInstance' && formValues.blockShapeRef) {
    entity.blockShapeRef = formValues.blockShapeRef
  }
  if (entityKey === 'partInstance' && formValues.partShapeRef) {
    entity.partShapeRef = formValues.partShapeRef
  }
  return entity as GlobalEntity<GE>
}
