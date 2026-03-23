import type { GlobalEntity } from '@/types/entities'

export function blockShapeDisplayNameForBlockInstance(
  blockEntity: GlobalEntity<'blockInstance'>,
  blockShapes: GlobalEntity<'blockShape'>[]
): string {
  const blockShape = blockShapes.find((bs) => bs.id === blockEntity.blockShapeRef)
  const name = blockShape?.name
  return name !== undefined && name !== null && name !== '' ? name : 'Block'
}
