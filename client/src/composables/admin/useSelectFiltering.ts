/**
 * WHY: Select Filtering Composable — thin orchestration; branchy filtering lives in selectFilteringResolve.
 */
import { computed } from 'vue'
import { useForm } from 'vee-validate'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { useAdmin } from './useAdmin'
import { useComponentEntity } from '../useComponentEntity'
import { createLogger } from '@/utils/logger'
import type { UseSelectFilteringOptions, UseSelectFilteringReturn } from '@/types/admin/selectFiltering'
import {
  resolveFilteredEntities,
  resolveParentTypeEntityKey,
  resolveParentTypeRefString,
} from '@/utils/admin/selectFilteringResolve'

const logger = createLogger('useSelectFiltering')

function buildTryReadFormValue(): (key: string) => string | null {
  return (key: string): string | null => {
    try {
      const form = useForm()
      if (form?.values && typeof form.values === 'object') {
        const formValues = form.values as Record<string, unknown>
        const v = formValues[key]
        return v != null ? String(v) : null
      }
    } catch (err) {
      logger.warn('Could not read form value', { key, err })
    }
    return null
  }
}

export function useSelectFiltering(options: UseSelectFilteringOptions): UseSelectFilteringReturn {
  const {
    allEntities,
    selectConfig,
    currentEntity,
    optionEntityKey,
    fieldContext,
    rawFieldValue,
    isAnnotationAssignmentSelect,
    isAttendeeSelect,
  } = options

  const adminComp = useAdmin()
  const tryReadFormValue = buildTryReadFormValue()
  const fieldKey = computed(() => String(fieldContext.state.fieldKey))

  const isActiveChildSelect = computed<boolean>(() => detectActiveChildSelect(selectConfig.value))

  const isDirectMatchingSelect = computed<boolean>(() => detectDirectMatchingSelect(selectConfig.value))

  const parentTypeEntityKey = computed<GlobalEntityKey | null>(() => {
    if (!isActiveChildSelect.value) {
      return null
    }
    return resolveParentTypeEntityKey(selectConfig.value, fieldContext.state.entityKey)
  })

  const parentTypeRef = computed<string | null>(() => {
    if (!isActiveChildSelect.value) {
      return null
    }
    return resolveParentTypeRefString(
      selectConfig.value,
      fieldContext.state.entityKey,
      currentEntity.value,
      String(fieldContext.state.entityId),
      tryReadFormValue
    )
  })

  const parentTypeEntity = computed<GlobalEntity<GlobalEntityKey> | null>(() => {
    if (!parentTypeEntityKey.value || !parentTypeRef.value) {
      return null
    }
    const entity = adminComp.getEntity(parentTypeEntityKey.value, toGlobalEntityId(parentTypeRef.value))
    return entity || null
  })

  const composedEntityComposable =
    String(fieldContext.state.fieldKey) === 'instanceComponents' && fieldContext.state.entityKey === 'blockInstance'
      ? useComponentEntity('blockInstance')
      : null

  const getUserTypeBlockShapeIds = (): Set<string> => {
    const allBlockShapes = adminComp.getEntities('blockShape')
    return new Set(
      allBlockShapes
        .filter((bs: GlobalEntity<'blockShape'>) => bs.type === 'user')
        .map((bs: GlobalEntity<'blockShape'>) => bs.id)
    )
  }

  const filteredEntities = computed(() =>
    resolveFilteredEntities({
      selectConfig: selectConfig.value,
      allEntities: allEntities.value,
      currentEntity: currentEntity.value,
      optionEntityKey: optionEntityKey.value,
      entityId: String(fieldContext.state.entityId),
      fieldKey: fieldKey.value,
      rawFieldValue: rawFieldValue.value,
      isAnnotationAssignmentSelect: isAnnotationAssignmentSelect.value,
      isAttendeeSelect: isAttendeeSelect.value,
      isActiveChildSelect: isActiveChildSelect.value,
      isDirectMatchingSelect: isDirectMatchingSelect.value,
      parentTypeRef: parentTypeRef.value,
      parentTypeEntity: parentTypeEntity.value,
      composedEntityData: composedEntityComposable
        ? {
            getAvailableComponents: (id: string) =>
              composedEntityComposable.data.getAvailableComponents(toGlobalEntityId(id)),
            getComponents: (id: string) =>
              composedEntityComposable.data.getComponents(toGlobalEntityId(id)),
          }
        : null,
      tryReadFormValue,
      getStateControlBlockShapeIds: getUserTypeBlockShapeIds,
    })
  )

  return {
    filteredEntities,
    isActiveChildSelect,
    isDirectMatchingSelect,
    parentTypeEntityKey,
    parentTypeRef,
    parentTypeEntity,
    isAttendeeSelect,
  }
}


function detectActiveChildSelect(config: unknown): boolean {
  if (!config || typeof config !== 'object') {
    return false
  }
  const c = config as Record<string, unknown>
  const hasCandidateParentKey = 'candidateParentKey' in c && !!c.candidateParentKey
  const hasCandidateParentPath = 'candidateParentPath' in c && !!c.candidateParentPath
  const hasCandidateChildPath =
    'candidateChildPath' in c && Array.isArray(c.candidateChildPath) && c.candidateChildPath.length > 0
  if (hasCandidateParentKey && hasCandidateParentPath && !hasCandidateChildPath) {
    const candidateParentKey = c.candidateParentKey as GlobalEntityKey
    const selectedParentKey = c.selectedParentKey as GlobalEntityKey
    return candidateParentKey !== selectedParentKey
  }
  return false
}

function detectDirectMatchingSelect(config: unknown): boolean {
  if (!config || typeof config !== 'object') {
    return false
  }
  const c = config as Record<string, unknown>
  const hasCandidateParentPath =
    'candidateParentPath' in c && Array.isArray(c.candidateParentPath) && c.candidateParentPath.length > 0
  const hasCandidateChildPath =
    'candidateChildPath' in c && Array.isArray(c.candidateChildPath) && c.candidateChildPath.length > 0
  return Boolean(hasCandidateParentPath && hasCandidateChildPath)
}
