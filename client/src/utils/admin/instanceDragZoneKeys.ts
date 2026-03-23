/** Distinct FormKit / map key for the "not standalone-only" expansion panels (per block shape). */
export function groupedInstanceDragZoneKey(blockShapeId: string): string {
  return `${blockShapeId}::grouped`
}
