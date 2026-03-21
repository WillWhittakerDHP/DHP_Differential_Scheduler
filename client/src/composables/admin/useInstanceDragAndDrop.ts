/**
 * PATTERN: Composable for instance drag-and-drop setup
PATTERN: Composable that man...
 */
import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount, onUnmounted, isRef, type Ref, type ComponentPublicInstance, type ComputedRef } from 'vue'
import { animations, handleEnd as formkitHandleEnd, performTransfer as formkitPerformTransfer } from '@formkit/drag-and-drop'
import { dragAndDrop } from '@formkit/drag-and-drop/vue'
import { rawBookingModeIsStandaloneOnly } from '@shared/utils/ternaryAliasUtils'
import { DEFAULT_VALUES } from '@/constants/entityFieldConstants'
import { useEntityDragHandlers } from './useEntityDragHandlers'
import { useEntityTabState } from './useEntityTabState'
import { getPanelsElement, countDraggableNodes, createMultiClassDraggableChecker, createExpansionPanelDraggableChecker } from './useDragAndDropHelpers'
import { createLogger } from '@/utils/logger'
import type { GlobalEntity } from '@/types/entities'
import type { PatchOrderIndex } from '@/types/admin/entityDragHandlers'
import type { UseInstanceDragAndDropOptions, UseInstanceDragAndDropReturn } from '@/types/admin/instanceDragAndDrop'

const logger = createLogger('useInstanceDragAndDrop')

const DEFAULT_BOOKING_MODE_STORAGE = DEFAULT_VALUES.DEFAULT_TERNARY_BOOKING_MODE

function isAdminStandaloneSection(instance: GlobalEntity<'blockInstance'>): boolean {
  const mode = instance.bookingMode ?? DEFAULT_BOOKING_MODE_STORAGE
  return rawBookingModeIsStandaloneOnly(mode)
}

/** Distinct FormKit / map key for the "not standalone-only" expansion panels (per block shape). */
export function groupedInstanceDragZoneKey(blockShapeId: string): string {
  return `${blockShapeId}::grouped`
}

function listMembershipSignature(instancesMap: Map<string, GlobalEntity<'blockInstance'>[]>): string {
  return Array.from(instancesMap.entries())
    .map(([shapeId, list]) => `${shapeId}:${[...list].map((i) => i.id).sort().join(',')}`)
    .sort()
    .join('|')
}

function dragLayoutSignature(
  mainMap: Map<string, GlobalEntity<'blockInstance'>[]>,
  groupedMap: Map<string, GlobalEntity<'blockInstance'>[]>
): string {
  return `${listMembershipSignature(mainMap)}||${listMembershipSignature(groupedMap)}`
}

function createGroupedZoneDragEndHandler(params: {
  blockShapeId: string
  groupedEntityIds: Ref<string[]>
  groupedEntityList: Ref<GlobalEntity<'blockInstance'>[]>
  blockInstancesByShape: ComputedRef<Map<string, GlobalEntity<'blockInstance'>[]>>
  patchOrderIndex: PatchOrderIndex
}): () => Promise<void> {
  const { blockShapeId, groupedEntityIds, groupedEntityList, blockInstancesByShape, patchOrderIndex } = params

  const syncGroupedFromSource = (): void => {
    const grouped = blockInstancesByShape.value.get(blockShapeId)?.filter((e) => !isAdminStandaloneSection(e)) ?? []
    groupedEntityList.value = [...grouped]
    groupedEntityIds.value = grouped.map((e) => e.id)
  }

  return async (): Promise<void> => {
    try {
      const all = blockInstancesByShape.value.get(blockShapeId) ?? []
      const idToEntity = new Map(all.map((e) => [e.id, e]))
      const mainOrderedStable = all.filter((e) => isAdminStandaloneSection(e))
      const groupedOrdered = groupedEntityIds.value
        .map((id) => idToEntity.get(id))
        .filter((e): e is GlobalEntity<'blockInstance'> => e !== undefined)
      const merged = [...mainOrderedStable, ...groupedOrdered]
      const updates = merged.map((entity, index) => ({
        id: entity.id,
        orderIndex: index
      }))
      groupedEntityList.value = groupedOrdered
      await patchOrderIndex(updates)
    } catch (_error) {
      logger.error('Failed to patch order index after grouped-zone drag', { error: _error, blockShapeId })
      syncGroupedFromSource()
    }
  }
}

/**
 * WHY: Composable for managing instance drag-and-drop
WHY: Centralizes drag-and...
 */
export function useInstanceDragAndDrop(
  options: UseInstanceDragAndDropOptions
): UseInstanceDragAndDropReturn {
  const {
    mainInstancesByShape,
    groupedInstancesByShape,
    blockInstancesByShape,
    patchBlockInstanceOrderIndex,
  } = options

  const blockInstancesLists = ref<Map<string, Ref<GlobalEntity<'blockInstance'>[]>>>(new Map())
  const blockInstanceIdsMap = ref<Map<string, Ref<string[]>>>(new Map())

  const groupContainers = ref<Map<string, HTMLElement | null>>(new Map())
  const groupPanelsContainers = ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>(new Map())
  const groupPanelsGroupedContainers = ref<Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>>(new Map())

  const groupDragHandlers = ref<Map<string, ReturnType<typeof useEntityDragHandlers<'blockInstance'>>>>(new Map())

  const groupDragInstances = ref<Map<string, ReturnType<typeof dragAndDrop>>>(new Map())
  const isMounted = ref(false)
  /** Bumps when standalone/grouped list membership changes so FormKit can re-bind after v-if remounts. */
  const dragReinitNonce = ref(0)
  /** Per zone key: nonce of the last successful FormKit bind (avoid re-init on unrelated map deep updates). */
  const shapeDragBoundNonce = ref<Map<string, number>>(new Map())
  let lastLayoutSignature = ''

  watch(
    () => [mainInstancesByShape.value, groupedInstancesByShape.value] as const,
    ([mainMap, groupedMap]) => {
      const nextSig = dragLayoutSignature(mainMap, groupedMap)
      if (nextSig !== lastLayoutSignature) {
        lastLayoutSignature = nextSig
        groupDragInstances.value.clear()
        shapeDragBoundNonce.value = new Map()
        dragReinitNonce.value += 1
      }

      mainMap.forEach((instances, blockShapeId) => {
        if (!blockInstancesLists.value.has(blockShapeId)) {
          blockInstancesLists.value.set(blockShapeId, ref([...instances]))
          blockInstanceIdsMap.value.set(blockShapeId, ref(instances.map((i) => i.id)))

          const filteredInstances = computed(() => {
            const raw = mainInstancesByShape.value.get(blockShapeId)
            return raw !== undefined ? raw : []
          })

          const dragHandlers = useEntityDragHandlers({
            entityIds: blockInstanceIdsMap.value.get(blockShapeId)!,
            entityList: blockInstancesLists.value.get(blockShapeId)!,
            filteredEntities: filteredInstances,
            patchOrderIndex: patchBlockInstanceOrderIndex
          })
          groupDragHandlers.value.set(blockShapeId, dragHandlers)

          useEntityTabState({
            filteredEntities: filteredInstances,
            dragHandlers
          })
        } else {
          const handlers = groupDragHandlers.value.get(blockShapeId)
          if (handlers) {
            handlers.syncArrays()
          }
        }
      })

      groupedMap.forEach((instances, blockShapeId) => {
        const zoneKey = groupedInstanceDragZoneKey(blockShapeId)
        if (instances.length > 0) {
          if (!blockInstancesLists.value.has(zoneKey)) {
            blockInstancesLists.value.set(zoneKey, ref([...instances]))
            blockInstanceIdsMap.value.set(zoneKey, ref(instances.map((i) => i.id)))

            const filteredGrouped = computed(() => {
              const raw = groupedInstancesByShape.value.get(blockShapeId)
              return raw !== undefined ? raw : []
            })

            const baseHandlers = useEntityDragHandlers({
              entityIds: blockInstanceIdsMap.value.get(zoneKey)!,
              entityList: blockInstancesLists.value.get(zoneKey)!,
              filteredEntities: filteredGrouped,
              patchOrderIndex: patchBlockInstanceOrderIndex
            })

            const groupedDragHandlers: ReturnType<typeof useEntityDragHandlers<'blockInstance'>> = {
              syncArrays: baseHandlers.syncArrays,
              handleDragEnd: createGroupedZoneDragEndHandler({
                blockShapeId,
                groupedEntityIds: blockInstanceIdsMap.value.get(zoneKey)!,
                groupedEntityList: blockInstancesLists.value.get(zoneKey)!,
                blockInstancesByShape,
                patchOrderIndex: patchBlockInstanceOrderIndex
              })
            }

            groupDragHandlers.value.set(zoneKey, groupedDragHandlers)

            useEntityTabState({
              filteredEntities: filteredGrouped,
              dragHandlers: groupedDragHandlers
            })
          } else {
            const handlers = groupDragHandlers.value.get(zoneKey)
            if (handlers) {
              handlers.syncArrays()
            }
          }
        } else {
          groupDragInstances.value.delete(zoneKey)
          shapeDragBoundNonce.value.delete(zoneKey)
          blockInstancesLists.value.delete(zoneKey)
          blockInstanceIdsMap.value.delete(zoneKey)
          groupDragHandlers.value.delete(zoneKey)
        }
      })

      const idsMap = blockInstanceIdsMap.value
      idsMap.forEach((_idsRef, dragKey) => {
        const ids = _idsRef.value
        if (ids.length === 0) {
          groupDragInstances.value.delete(dragKey)
          shapeDragBoundNonce.value.delete(dragKey)
        }
      })
    },
    { immediate: true, deep: true }
  )

  function tearDownZoneDrag(dragKey: string): void {
    groupDragInstances.value.delete(dragKey)
    shapeDragBoundNonce.value.delete(dragKey)
  }

  function tryBindFormKitForZone(params: {
    dragKey: string
    blockShapeIdForClass: string
    panelsRefHolder: Ref<ComponentPublicInstance | HTMLElement | null> | undefined
  }): void {
    const { dragKey, blockShapeIdForClass, panelsRefHolder } = params

    const instancesList = blockInstancesLists.value.get(dragKey)
    const instanceIds = blockInstanceIdsMap.value.get(dragKey)
    const dragHandlers = groupDragHandlers.value.get(dragKey)

    if (!instancesList || !instanceIds || !dragHandlers || !panelsRefHolder) {
      tearDownZoneDrag(dragKey)
      return
    }

    const rawHolder = isRef(panelsRefHolder) ? panelsRefHolder.value : panelsRefHolder
    if (rawHolder === null || rawHolder === undefined) {
      tearDownZoneDrag(dragKey)
      return
    }

    nextTick(() => {
      if (!isMounted.value) {
        return
      }

      try {
        const panelsEl = getPanelsElement(
          isRef(panelsRefHolder) ? panelsRefHolder.value : panelsRefHolder,
          null,
          undefined,
          false
        )
        if (!panelsEl || !(panelsEl instanceof HTMLElement)) {
          tearDownZoneDrag(dragKey)
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/5ff73cac-8a24-4887-b0ff-95e393d137d4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0be11e'},body:JSON.stringify({sessionId:'0be11e',runId:'post-stale',hypothesisId:'H-panels-null',location:'useInstanceDragAndDrop.ts:tryBind',message:'panelsEl missing teardown',data:{dragKey},timestamp:Date.now()})}).catch(()=>{})
          // #endregion
          return
        }

        const layoutNonce = dragReinitNonce.value
        // WHY: Do not skip re-init when nonce matches — VWindow tab switches remount DOM while
        //      dragReinitNonce is unchanged; FormKit would stay bound to detached nodes.
        void layoutNonce

        const panelsRefForDrag = ref(panelsEl)

        const instanceIdsArray = instanceIds.value
        if (!instanceIdsArray || instanceIdsArray.length === 0) {
          return
        }

        const draggableClasses = [`draggable-instance-${blockShapeIdForClass}`, 'draggable-instance-item']
        const isDraggableChecker = createMultiClassDraggableChecker(draggableClasses)
        const enabledNodesCount = countDraggableNodes(panelsEl, isDraggableChecker)

        if (enabledNodesCount !== instanceIdsArray.length) {
          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/5ff73cac-8a24-4887-b0ff-95e393d137d4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0be11e'},body:JSON.stringify({sessionId:'0be11e',runId:'dual-zone',hypothesisId:'H-count-mismatch',location:'useInstanceDragAndDrop.ts:tryBind',message:'draggable count vs ids',data:{dragKey,enabledNodesCount,idsLen:instanceIdsArray.length},timestamp:Date.now()})}).catch(()=>{})
          // #endregion
          return
        }

        groupDragInstances.value.delete(dragKey)

        tearDownZoneDrag(dragKey)
        groupDragInstances.value.set(
          dragKey,
          dragAndDrop({
            parent: panelsRefForDrag,
            values: instanceIds,
            group: `blockInstances-${dragKey}`,
            dragHandle: '.instance-drag-handle',
            draggable: createExpansionPanelDraggableChecker(isDraggableChecker),
            plugins: [animations()],
            performTransfer: (arg) => {
              formkitPerformTransfer(arg)
            },
            handleEnd: (state) => {
              formkitHandleEnd(state)
              void dragHandlers.handleDragEnd()
            },
          })
        )
        shapeDragBoundNonce.value.set(dragKey, layoutNonce)
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/5ff73cac-8a24-4887-b0ff-95e393d137d4',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'0be11e'},body:JSON.stringify({sessionId:'0be11e',runId:'post-stale',hypothesisId:'H-ok',location:'useInstanceDragAndDrop.ts:tryBind',message:'drag bound',data:{dragKey,idsLen:instanceIdsArray.length,enabledNodesCount},timestamp:Date.now()})}).catch(()=>{})
        // #endregion
      } catch (error) {
        logger.debug('Failed to initialize drag and drop for group', { error, dragKey })
      }
    })
  }

  function panelRefSnapshot(
    m: Map<string, Ref<ComponentPublicInstance | HTMLElement | null>>
  ): Array<string | ComponentPublicInstance | HTMLElement | null> {
    const out: Array<string | ComponentPublicInstance | HTMLElement | null> = []
    m.forEach((holder, shapeId) => {
      out.push(shapeId, isRef(holder) ? holder.value : holder)
    })
    return out
  }

  watch(
    () =>
      [
        groupContainers.value,
        dragReinitNonce.value,
        isMounted.value,
        ...panelRefSnapshot(groupPanelsContainers.value),
        ...panelRefSnapshot(groupPanelsGroupedContainers.value),
      ] as const,
    ([containers]) => {
      if (!isMounted.value) {
        return
      }

      if (!containers || !(containers instanceof Map)) {
        return
      }

      containers.forEach((_container, blockShapeId) => {
        tryBindFormKitForZone({
          dragKey: blockShapeId,
          blockShapeIdForClass: blockShapeId,
          panelsRefHolder: groupPanelsContainers.value.get(blockShapeId),
        })

        const groupedZoneKey = groupedInstanceDragZoneKey(blockShapeId)
        const groupedIds = blockInstanceIdsMap.value.get(groupedZoneKey)?.value
        if (groupedIds && groupedIds.length > 0) {
          tryBindFormKitForZone({
            dragKey: groupedZoneKey,
            blockShapeIdForClass: blockShapeId,
            panelsRefHolder: groupPanelsGroupedContainers.value.get(blockShapeId),
          })
        }
      })
    },
    { immediate: true, deep: true, flush: 'post' }
  )

  onMounted(() => {
    isMounted.value = true
  })

  onBeforeUnmount(() => {
    isMounted.value = false
    groupDragInstances.value.forEach(_instance => {
    })
    groupDragInstances.value.clear()
  })

  onUnmounted(() => {
    groupContainers.value.clear()
    groupPanelsContainers.value.clear()
    groupPanelsGroupedContainers.value.clear()
    blockInstancesLists.value.clear()
    blockInstanceIdsMap.value.clear()
    groupDragHandlers.value.clear()
  })

  return {
    blockInstancesLists,
    blockInstanceIdsMap,
    groupContainers,
    groupPanelsContainers,
    groupPanelsGroupedContainers,
    groupDragHandlers,
    groupDragInstances,
    isMounted
  }
}
