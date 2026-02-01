import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { AnnotationInstance, AnnotationWithMetadata } from '@/types/annotations'
import type { BlockInstanceEntity, GlobalEntity } from '@/types/entities'
import type { GlobalEntityId } from '@/types/entities'
import { isDevModeEnabled } from '@/utils/env/devMode'

/**
 * Optimistic update helpers for AnnotationAssignment mutations.
 *
 * LEARNING: Annotation assignments impact *two* client-side data surfaces:
 * - The relationship query cache: `['blockInstanceAnnotations', blockInstanceId]`
 * - The hydrated GlobalData cache: `['globalData']` → `blockInstance.annotations` + derived `blockInstance.description`
 *
 * WHY: `globalData` embeds annotations directly on `blockInstance` for fast reads (and legacy `description` support),
 * so updating only the relationship list would leave the UI stale.
 *
 * PATTERN: Keep these helpers pure (old -> next) so composables can:
 * - snapshot previous cache values in `onMutate`
 * - apply optimistic updates via `queryClient.setQueryData`
 * - rollback safely in `onError`
 */
// LEARNING: Types used internally - not exported as they're not part of public API
type AnnotationAssignmentLike = {
  id: string
  blockInstanceId: string
  annotationId: string
  orderIndex: number
  isDefault: boolean
  userTypeBlockBlockInstanceId: GlobalEntityId | null
}

type AnnotationAssignmentPatch = Partial<Pick<AnnotationAssignmentLike, 'orderIndex' | 'isDefault' | 'userTypeBlockBlockInstanceId'>>

type FindResult = { entity: BlockInstanceEntity; index: number } | null

function findBlockInstance(
  blockInstances: GlobalEntity<'blockInstance'>[],
  blockInstanceId: GlobalEntityId
): FindResult {
  const index = blockInstances.findIndex((entity) => String(entity.id) === String(blockInstanceId))
  if (index === -1) return null
  return { entity: blockInstances[index] as BlockInstanceEntity, index }
}

function sortByOrderIndex(annotations: AnnotationWithMetadata[]): AnnotationWithMetadata[] {
  return [...annotations].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
}

function clearOtherDefaults(
  annotations: AnnotationWithMetadata[],
  keepDefaultAnnotationId: string
): AnnotationWithMetadata[] {
  return annotations.map((annotation) => {
    if (annotation.id === keepDefaultAnnotationId) return annotation
    if (annotation.isDefault !== true) return annotation
    return { ...annotation, isDefault: false }
  })
}

/**
 * Derive the single `description` string on a block instance based on its annotations.
 *
 * Matches the logic used in `fetchToGlobalTransformer.hydrate()`:
 * - Prefer `isDefault === true`
 * - Else prefer the "generic" annotation (`userTypeBlock === null`)
 * - Else first annotation
 * 
 * LEARNING: Function used internally - not exported as it's not part of public API
 * WHY: This function is only used within this file for internal calculations
 */
function deriveBlockInstanceDescriptionFromAnnotations(
  annotations: AnnotationWithMetadata[]
): string {
  const defaultAnnotation = annotations.find((ann) => ann.isDefault === true)
  const selected = defaultAnnotation ?? annotations.find((ann) => ann.userTypeBlock === null) ?? annotations[0]
  return selected?.text ?? ''
}

function toAnnotationWithMetadata(
  annotation: AnnotationInstance,
  assignment: Pick<AnnotationAssignmentLike, 'orderIndex' | 'isDefault' | 'userTypeBlockBlockInstanceId'>
): AnnotationWithMetadata {
  const effectiveUserTypeBlock = assignment.userTypeBlockBlockInstanceId ?? annotation.userTypeBlock
  return {
    ...annotation,
    userTypeBlock: effectiveUserTypeBlock,
    orderIndex: assignment.orderIndex,
    isDefault: assignment.isDefault,
  }
}

function updateBlockInstanceEntityInGlobalData(params: {
  old: GlobalData
  blockInstanceId: GlobalEntityId
  updater: (current: BlockInstanceEntity) => BlockInstanceEntity
}): GlobalData {
  const { old, blockInstanceId, updater } = params

  const currentBlockInstances = (old.entities.blockInstance || []) as GlobalEntity<'blockInstance'>[]
  const found = findBlockInstance(currentBlockInstances, blockInstanceId)
  if (!found) return old

  const updatedEntity = updater(found.entity)
  const updatedBlockInstances = [...currentBlockInstances]
  updatedBlockInstances[found.index] = updatedEntity as GlobalEntity<'blockInstance'>

  return {
    ...old,
    entities: {
      ...old.entities,
      blockInstance: updatedBlockInstances as unknown as Array<GlobalEntity<keyof GlobalData['entities']>>,
    },
  }
}



