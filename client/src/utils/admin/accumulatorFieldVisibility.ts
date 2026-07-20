import { BLOCK_SHAPE_TYPES, type BlockShapeType } from '@/constants/blockShapeTypes'

/**
 * WHY: Accumulation is atomic service → atomic time characteristic only.
 * Composite packages (Buyer’s Inspection, Blue Tape, property-type packages) use
 * instanceComponents / booking activation instead — not accumulator links.
 */
export function isAtomicAccumulatorServiceForm(params: {
  semanticType: BlockShapeType | null | undefined
  composite: unknown
}): boolean {
  return (
    params.semanticType === BLOCK_SHAPE_TYPES.SERVICE &&
    params.composite !== true
  )
}

export function isAtomicBlockInstance(entity: { composite?: boolean } | null | undefined): boolean {
  return entity?.composite !== true
}
