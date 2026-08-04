import { BLOCK_SHAPE_TYPES, type BlockShapeType } from '@/constants/blockShapeTypes'
import type { GlobalEntity } from '@/types/entities'
import type { CreateRelationshipPayload, FetchedRelationship, GlobalRelationship } from '@/types/relationships'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { calculateArrayDiff } from '@/utils/collections/arrayDiff'
import { isWizardTopLine } from '@shared/constants/wizardPlacement'

type CreateBookingCascade = (payload: CreateRelationshipPayload) => Promise<FetchedRelationship>
type RemoveBookingCascade = (parentId: GlobalEntityId, childId: GlobalEntityId) => Promise<void>

export interface ServiceActiveBlockOption {
  id: string
  title: string
  shapeName: string
}

export interface ServiceBlockActivationState {
  timeOptions: ServiceActiveBlockOption[]
  feeOptions: ServiceActiveBlockOption[]
  selectedTimeIds: string[]
  selectedFeeIds: string[]
}

function idOf(entity: { id: unknown }): string {
  return String(entity.id)
}

function shapeForBlock(
  block: GlobalEntity<'blockInstance'>,
  blockShapesById: Map<string, GlobalEntity<'blockShape'>>
): GlobalEntity<'blockShape'> | undefined {
  return blockShapesById.get(String(block.blockShapeRef))
}

function optionForBlock(
  block: GlobalEntity<'blockInstance'>,
  blockShapesById: Map<string, GlobalEntity<'blockShape'>>
): ServiceActiveBlockOption {
  return {
    id: idOf(block),
    title: block.name,
    shapeName: shapeForBlock(block, blockShapesById)?.name ?? 'Block',
  }
}

function allowedShapeIdsForService(
  serviceBlock: GlobalEntity<'blockInstance'>,
  blockShapesById: Map<string, GlobalEntity<'blockShape'>>
): Set<string> {
  const serviceShape = shapeForBlock(serviceBlock, blockShapesById)
  return new Set((serviceShape?.validBookingCascades ?? []).map((id) => String(id)))
}

function candidateOptionsForSemantic(params: {
  serviceBlockId: string
  semanticType: BlockShapeType
  allowedShapeIds: Set<string>
  blockInstances: GlobalEntity<'blockInstance'>[]
  blockShapesById: Map<string, GlobalEntity<'blockShape'>>
}): ServiceActiveBlockOption[] {
  return params.blockInstances
    .filter((block) => {
      if (idOf(block) === params.serviceBlockId) return false
      if (block.active === false) return false
      if (!isWizardTopLine(block.wizardPlacement)) return false
      const shape = shapeForBlock(block, params.blockShapesById)
      return shape?.semanticType === params.semanticType && params.allowedShapeIds.has(idOf(shape))
    })
    .map((block) => optionForBlock(block, params.blockShapesById))
    .sort((a, b) => a.title.localeCompare(b.title))
}

function selectedBlocksForSemantic(params: {
  serviceBlockId: string
  semanticType: BlockShapeType
  bookingCascades: GlobalRelationship[]
  blockInstancesById: Map<string, GlobalEntity<'blockInstance'>>
  blockShapesById: Map<string, GlobalEntity<'blockShape'>>
}): GlobalEntity<'blockInstance'>[] {
  return params.bookingCascades
    .filter((rel) => String(rel.parent.id) === params.serviceBlockId)
    .flatMap((rel) => rel.children.map((child) => String(child.id)))
    .map((blockId) => params.blockInstancesById.get(blockId))
    .filter((block): block is GlobalEntity<'blockInstance'> => {
      if (!block) return false
      const shape = shapeForBlock(block, params.blockShapesById)
      return shape?.semanticType === params.semanticType
    })
}

function optionsIncludingSelected(
  candidates: ServiceActiveBlockOption[],
  selectedBlocks: GlobalEntity<'blockInstance'>[],
  blockShapesById: Map<string, GlobalEntity<'blockShape'>>
): ServiceActiveBlockOption[] {
  const optionsById = new Map(candidates.map((option) => [option.id, option]))
  for (const block of selectedBlocks) {
    if (!optionsById.has(idOf(block))) {
      optionsById.set(idOf(block), optionForBlock(block, blockShapesById))
    }
  }
  return [...optionsById.values()].sort((a, b) => a.title.localeCompare(b.title))
}

export function buildServiceBlockActivationState(params: {
  serviceBlockId: string
  blockInstances: GlobalEntity<'blockInstance'>[]
  blockShapes: GlobalEntity<'blockShape'>[]
  bookingCascades: GlobalRelationship[]
}): ServiceBlockActivationState {
  const blockShapesById = new Map(params.blockShapes.map((shape) => [idOf(shape), shape]))
  const blockInstancesById = new Map(params.blockInstances.map((block) => [idOf(block), block]))
  const serviceBlock = blockInstancesById.get(params.serviceBlockId)
  if (!serviceBlock) {
    return { timeOptions: [], feeOptions: [], selectedTimeIds: [], selectedFeeIds: [] }
  }
  const allowedShapeIds = allowedShapeIdsForService(serviceBlock, blockShapesById)
  const base = {
    serviceBlockId: params.serviceBlockId,
    allowedShapeIds,
    blockInstances: params.blockInstances,
    blockShapesById,
  }
  const selectedBase = {
    serviceBlockId: params.serviceBlockId,
    bookingCascades: params.bookingCascades,
    blockInstancesById,
    blockShapesById,
  }
  const selectedTimeBlocks = selectedBlocksForSemantic({ ...selectedBase, semanticType: BLOCK_SHAPE_TYPES.TIME })
  const selectedFeeBlocks = selectedBlocksForSemantic({ ...selectedBase, semanticType: BLOCK_SHAPE_TYPES.PRICE })
  const timeCandidates = candidateOptionsForSemantic({ ...base, semanticType: BLOCK_SHAPE_TYPES.TIME })
  const feeCandidates = candidateOptionsForSemantic({ ...base, semanticType: BLOCK_SHAPE_TYPES.PRICE })
  return {
    timeOptions: optionsIncludingSelected(timeCandidates, selectedTimeBlocks, blockShapesById),
    feeOptions: optionsIncludingSelected(feeCandidates, selectedFeeBlocks, blockShapesById),
    selectedTimeIds: selectedTimeBlocks.map((block) => idOf(block)),
    selectedFeeIds: selectedFeeBlocks.map((block) => idOf(block)),
  }
}

export async function syncActiveBlockRelationships(params: {
  serviceBlockId: string
  oldIds: readonly unknown[]
  newIds: readonly unknown[]
  createBookingCascade: CreateBookingCascade
  removeBookingCascade: RemoveBookingCascade
}): Promise<void> {
  const parentId = toGlobalEntityId(params.serviceBlockId)
  const oldIds = params.oldIds.map((id) => String(id))
  const newIds = params.newIds.map((id) => String(id))
  const { toAdd, toRemove } = calculateArrayDiff(oldIds, newIds)
  await Promise.all([
    ...toAdd.map((childId) => params.createBookingCascade({ parentId, childId: toGlobalEntityId(childId) })),
    ...toRemove.map((childId) => params.removeBookingCascade(parentId, toGlobalEntityId(childId))),
  ])
}
