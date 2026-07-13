/**
 * WHY: Global to Booking Transformer
 */
import type { GlobalData } from '@/types/transformers/globalData'
import type { GlobalEntity } from '@/types/entities'
import type { BookingBlockShape, BookingData, BookingBlockInstance } from '@/types/transformers/bookingData'
import { safeArray } from './transformerPrimitives'
import { immutableSort } from './transformerCollections'
import { buildBookingBlockAnnotationUi } from './buildBookingBlockAnnotationUi'
import {
  filterAndSortBlockInstances,
  isWizardTopLineBlock,
  isWizardSubOptionBlock,
} from './globalToBookingTransformerBlocks'

export type {
  BookingAnnotationUiCandidate,
  BookingBlockAnnotationUi,
  BookingBlockInstance,
  BookingBlockShape,
  BookingData,
  BookingPartInstance,
} from '@/types/transformers/bookingData'

export function transformGlobalToBooking(globalData: GlobalData): BookingData {
  const { entities, relationships } = globalData
  const blockShapes = safeArray(entities.blockShape) as GlobalEntity<'blockShape'>[]
  const blockInstances = safeArray(entities.blockInstance) as GlobalEntity<'blockInstance'>[]
  const partShapes = safeArray(entities.partShape) as GlobalEntity<'partShape'>[]
  const partInstances = safeArray(entities.partInstance) as GlobalEntity<'partInstance'>[]
  const partAssignmentsRelationships = safeArray(relationships.partAssignments)
  const bookingCascadesRelationships = safeArray(relationships.bookingCascades)
  const instanceComponentsRelationships = safeArray(relationships.instanceComponents)
  const pricingCascadesRelationships = safeArray(relationships.pricingCascades)

  const partInstanceById = new Map(
    partInstances.map((partInstance) => [partInstance.id, partInstance])
  )
  const blockShapeById = new Map(
    blockShapes.map((blockShape) => [blockShape.id, blockShape])
  )
  const partShapeById = new Map(
    partShapes.map((partShape) => [partShape.id, partShape])
  )

  const componentIds = new Set(
    instanceComponentsRelationships
      .filter((rel) => rel.relationshipKind === 'instanceComponents')
      .flatMap((rel) => rel.children.map((child) => child.id))
  )

  const bookingBlockInstances = filterAndSortBlockInstances(
    blockInstances,
    componentIds,
    (bi) => isWizardTopLineBlock(bi),
    partAssignmentsRelationships,
    bookingCascadesRelationships,
    instanceComponentsRelationships,
    pricingCascadesRelationships,
    partInstanceById,
    blockShapeById,
    partShapeById
  )

  const lineItemBlocks = filterAndSortBlockInstances(
    blockInstances,
    componentIds,
    (bi) => isWizardSubOptionBlock(bi),
    partAssignmentsRelationships,
    bookingCascadesRelationships,
    instanceComponentsRelationships,
    pricingCascadesRelationships,
    partInstanceById,
    blockShapeById,
    partShapeById
  )

  const bookingBlockShapes: BookingBlockShape[] = immutableSort(
    blockShapes.map((blockShape) => ({
      id: blockShape.id,
      name: blockShape.name,
      semanticType: blockShape.semanticType,
    })),
    (a, b) => a.name.localeCompare(b.name)
  )

  function withAnnotationUi(blocks: BookingBlockInstance[]): BookingBlockInstance[] {
    return blocks.map((b) => {
      const ui = buildBookingBlockAnnotationUi(b.id, globalData)
      return ui !== undefined ? { ...b, annotationUi: ui } : b
    })
  }

  return {
    blockInstances: withAnnotationUi(bookingBlockInstances),
    lineItemBlocks: withAnnotationUi(lineItemBlocks),
    blockShapes: bookingBlockShapes,
  }
}

/** Backward-compatible singleton: use transformGlobalToBooking(globalData) or bookingTransformer.transformGlobalToBooking(globalData). */
export const bookingTransformer = {
  transformGlobalToBooking,
}
