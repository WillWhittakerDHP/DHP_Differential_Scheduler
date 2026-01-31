import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import type { Annotation, AnnotationWithMetadata } from '@/types/annotations'
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
export type AnnotationAssignmentLike = {
  id: string
  blockInstanceId: string
  annotationId: string
  orderIndex: number
  isDefault: boolean
  userTypeBlockBlockInstanceId: GlobalEntityId | null
}

export type AnnotationAssignmentPatch = Partial<Pick<AnnotationAssignmentLike, 'orderIndex' | 'isDefault' | 'userTypeBlockBlockInstanceId'>>

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
 */
export function deriveBlockInstanceDescriptionFromAnnotations(
  annotations: AnnotationWithMetadata[]
): string {
  const defaultAnnotation = annotations.find((ann) => ann.isDefault === true)
  const selected = defaultAnnotation ?? annotations.find((ann) => ann.userTypeBlock === null) ?? annotations[0]
  return selected?.text ?? ''
}

function toAnnotationWithMetadata(
  annotation: Annotation,
  assignment: Pick<AnnotationAssignmentLike, 'orderIndex' | 'isDefault' | 'userTypeBlockBlockInstanceId'>
): AnnotationWithMetadata {
  // Effective userTypeBlock: through-table override takes precedence.
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

export function applyOptimisticAssignmentCreateToGlobalData(params: {
  old: GlobalData
  blockInstanceId: GlobalEntityId
  assignment: Pick<AnnotationAssignmentLike, 'annotationId' | 'orderIndex' | 'isDefault' | 'userTypeBlockBlockInstanceId'>
  devWarningPrefix?: string
}): GlobalData {
  const { old, blockInstanceId, assignment, devWarningPrefix } = params

  // LEARNING: Annotations are now in entities.annotationInstance
  // WHY: Annotations are now core entities stored in entities section
  const baseAnnotations = (old.entities.annotationInstance || []) as Annotation[]
  const baseAnnotation = baseAnnotations.find((ann) => ann.id === assignment.annotationId)
  if (!baseAnnotation) {
    if (isDevModeEnabled()) {
      console.warn(
        `${devWarningPrefix ?? '[annotationAssignmentsOptimistic]'} Base annotation not found in globalData.entities.annotationInstance`,
        { annotationId: assignment.annotationId }
      )
    }
    return old
  }

  return updateBlockInstanceEntityInGlobalData({
    old,
    blockInstanceId,
    updater: (current) => {
      const currentAnnotations = current.annotations ?? []
      const withoutExisting = currentAnnotations.filter((ann) => ann.id !== assignment.annotationId)

      const nextAnnotation = toAnnotationWithMetadata(baseAnnotation, assignment)
      const nextAnnotationsRaw = [...withoutExisting, nextAnnotation]
      const nextAnnotationsWithDefaults = assignment.isDefault
        ? clearOtherDefaults(nextAnnotationsRaw, assignment.annotationId)
        : nextAnnotationsRaw
      const nextAnnotations = sortByOrderIndex(nextAnnotationsWithDefaults)

      return {
        ...current,
        annotations: nextAnnotations,
        description: deriveBlockInstanceDescriptionFromAnnotations(nextAnnotations),
      }
    },
  })
}

export function applyOptimisticAssignmentPatchToGlobalData(params: {
  old: GlobalData
  blockInstanceId: GlobalEntityId
  annotationId: string
  patch: AnnotationAssignmentPatch
}): GlobalData {
  const { old, blockInstanceId, annotationId, patch } = params

  return updateBlockInstanceEntityInGlobalData({
    old,
    blockInstanceId,
    updater: (current) => {
      const currentAnnotations = current.annotations ?? []
      const index = currentAnnotations.findIndex((ann) => ann.id === annotationId)
      if (index === -1) return current

      const currentAnnotation = currentAnnotations[index]
      const nextAnnotation: AnnotationWithMetadata = {
        ...currentAnnotation,
        ...(patch.orderIndex !== undefined ? { orderIndex: patch.orderIndex } : {}),
        ...(patch.isDefault !== undefined ? { isDefault: patch.isDefault } : {}),
        ...(patch.userTypeBlockBlockInstanceId !== undefined ? { userTypeBlock: patch.userTypeBlockBlockInstanceId } : {}),
      }

      const updatedAnnotations = [...currentAnnotations]
      updatedAnnotations[index] = nextAnnotation

      const maybeClearedDefaults =
        patch.isDefault === true ? clearOtherDefaults(updatedAnnotations, annotationId) : updatedAnnotations

      const nextAnnotations = sortByOrderIndex(maybeClearedDefaults)

      return {
        ...current,
        annotations: nextAnnotations,
        description: deriveBlockInstanceDescriptionFromAnnotations(nextAnnotations),
      }
    },
  })
}

export function applyOptimisticAssignmentDeleteToGlobalData(params: {
  old: GlobalData
  blockInstanceId: GlobalEntityId
  annotationId: string
}): GlobalData {
  const { old, blockInstanceId, annotationId } = params

  return updateBlockInstanceEntityInGlobalData({
    old,
    blockInstanceId,
    updater: (current) => {
      const currentAnnotations = current.annotations ?? []
      const nextAnnotations = currentAnnotations.filter((ann) => ann.id !== annotationId)

      return {
        ...current,
        annotations: nextAnnotations,
        description: nextAnnotations.length > 0 ? deriveBlockInstanceDescriptionFromAnnotations(nextAnnotations) : '',
      }
    },
  })
}

export function optimisticUpsertAssignmentInList<TAssignment extends AnnotationAssignmentLike>(params: {
  old: TAssignment[] | undefined
  next: TAssignment
}): TAssignment[] {
  const { old, next } = params
  const current = old ?? []

  const withoutSame = current.filter((rel) => rel.annotationId !== next.annotationId)
  return [...withoutSame, next].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
}

export function optimisticPatchAssignmentInList<TAssignment extends AnnotationAssignmentLike>(params: {
  old: TAssignment[] | undefined
  annotationId: string
  patch: AnnotationAssignmentPatch
}): TAssignment[] {
  const { old, annotationId, patch } = params
  const current = old ?? []

  const next = current.map((rel) => {
    if (rel.annotationId !== annotationId) return rel
    return {
      ...rel,
      ...(patch.orderIndex !== undefined ? { orderIndex: patch.orderIndex } : {}),
      ...(patch.isDefault !== undefined ? { isDefault: patch.isDefault } : {}),
      ...(patch.userTypeBlockBlockInstanceId !== undefined ? { userTypeBlockBlockInstanceId: patch.userTypeBlockBlockInstanceId } : {}),
    }
  })

  return [...next].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
}

export function optimisticRemoveAssignmentFromList<TAssignment extends AnnotationAssignmentLike>(params: {
  old: TAssignment[] | undefined
  annotationId: string
}): TAssignment[] {
  const { old, annotationId } = params
  const current = old ?? []
  return current.filter((rel) => rel.annotationId !== annotationId)
}


