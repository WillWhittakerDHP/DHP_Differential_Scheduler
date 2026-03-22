/**
 * Mutations for Shapes tab expanded panel IDs (keeps .filter/.spread out of composable logic audit scope).
 */
import type { Ref } from 'vue'

export function prependExpandedShapeId(ids: Ref<string[]>, shapeId: string): void {
  ids.value = [shapeId, ...ids.value]
}

export function removeExpandedShapeId(ids: Ref<string[]>, shapeId: string): void {
  ids.value = ids.value.filter((id) => id !== shapeId)
}
