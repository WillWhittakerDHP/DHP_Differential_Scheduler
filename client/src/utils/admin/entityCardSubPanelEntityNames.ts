import type { GlobalEntity } from '@/types/entities'

export function getEntityNamesForCard(
  ids: unknown[],
  entityType: 'blockInstance' | 'partInstance',
  blockInstances: GlobalEntity<'blockInstance'>[],
  partInstances: GlobalEntity<'partInstance'>[]
): string[] {
  if (!Array.isArray(ids)) return []
  const entities = entityType === 'blockInstance' ? blockInstances : partInstances
  return ids
    .map((id) => {
      const found = entities.find((e) => e.id === id)
      return found?.name ?? null
    })
    .filter((name): name is string => name !== null)
}

export function getPartShapeNamesForCard(ids: unknown[], partShapes: GlobalEntity<'partShape'>[]): string[] {
  if (!Array.isArray(ids)) return []
  return ids
    .map((id) => {
      const found = partShapes.find((e) => e.id === id)
      return found?.name ?? null
    })
    .filter((name): name is string => name !== null)
}
