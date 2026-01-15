import { toRaw } from 'vue'
import type { AxiosError } from 'axios'
import type { GlobalEntityKey } from '@/constants/entities'
import { RELATIONSHIP_KEYS } from '@/constants/relationships'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId } from '@/types/entities'
import type { CreateRelationshipPayload } from '@/types/relationships'
import { getEntityByIdEndpoint, getRelationshipByParentChildEndpoint, getRelationshipEndpoint } from '@/utils/api'
import apiClient from '@/utils/api'
import type { UseFieldContextStateReturn } from './useFieldContextState'

export type UseFieldContextActionsReturn = {
  setFocus: (focused: boolean) => void
  validate: () => Promise<boolean>
  clearError: () => void
  save: () => Promise<void>
  reset: () => void
  getValue: () => ValidAdminValue
  setValue: (value: ValidAdminValue) => void
}

/**
 * Actions module for `useFieldContext`.
 *
 * NOTE: This preserves existing behavior; it’s mainly a mechanical extraction to reduce file size.
 */
export function useFieldContextActions<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  state: UseFieldContextStateReturn<GE, FieldKey>
): UseFieldContextActionsReturn {
  const setFocus = (focused: boolean): void => {
    state.isFocused.value = focused
  }

  const validate = async (): Promise<boolean> => {
    state.isValidating.value = true
    try {
      await state.validateField()
      return state.isValid.value
    } finally {
      state.isValidating.value = false
    }
  }

  const clearError = (): void => {
    state.handleChange(state.value.value)
  }

  const save = async (): Promise<void> => {
    if (!state.isDirty.value) {
      return
    }

    const entityIdString = String(state.entityId)
    const isTempEntity = entityIdString.startsWith('new-')
    const isPlaceholderEntity = entityIdString === '00000000-0000-0000-0000-000000000000'

    if (isTempEntity || isPlaceholderEntity) {
      return
    }

    const currentEntity = state.entity.value as { id?: string; name?: string; entityKey?: string } | undefined
    // NOTE: allEntitiesInStore computation removed as it's not used - kept comment for future reference

    try {
      const verifyEndpoint = getEntityByIdEndpoint(state.entityKey, String(state.entityId))
      await apiClient.get(verifyEndpoint)
    } catch (verifyError: unknown) {
      const axiosError = verifyError as AxiosError<{ error?: string; id?: string }>

      if (axiosError.response?.status === 404) {
        state.queryClient.invalidateQueries({ queryKey: [state.entityKey] })
        state.queryClient.invalidateQueries({ queryKey: ['globalData'] })
        throw new Error(
          `Entity ${state.entityKey} with ID ${state.entityId} does not exist on server. Cache will be refreshed.`
        )
      }
      throw axiosError
    }

    if (!currentEntity) {
      const errorMessage = `Cannot save field ${String(state.fieldKey)}: Entity ${state.entityKey} with ID ${state.entityId} not found in store`
      throw new Error(errorMessage)
    }

    if (!entityIdString || entityIdString.trim() === '') {
      const errorMessage = `Invalid entity ID: ${entityIdString}`
      throw new Error(errorMessage)
    }

    try {
      const isValidResult = await validate()
      if (!isValidResult) {
        throw new Error(`Validation failed for field ${String(state.fieldKey)}`)
      }

      const fieldKeyString = String(state.fieldKey)

      if (state.composedEntityComposable) {
        const { addToComponent, removeFromComponent, getComponents } = state.composedEntityComposable

        const currentComponents = getComponents(String(state.entityId))
        const oldComponentIds = new Set(currentComponents.map((ea) => ea.childId))

        const rawValue = state.value.value
        const plainValue = toRaw(rawValue)
        const newComponentIds = Array.isArray(plainValue)
          ? new Set(plainValue.map((v: unknown) => String(v)))
          : plainValue
            ? new Set([String(plainValue)])
            : new Set<string>()

        const toAdd = Array.from(newComponentIds).filter((id) => !oldComponentIds.has(id))
        const toRemove = Array.from(oldComponentIds).filter((id) => !newComponentIds.has(id))

        const promises: Promise<void>[] = [
          ...toAdd.map((componentId, index) =>
            addToComponent({
              composerId: String(state.entityId),
              componentId,
              orderIndex: currentComponents.length + index,
            }).catch((error: unknown) => {
              const axiosErr = error as AxiosError
              if (axiosErr?.response?.status === 409) {
                return Promise.resolve()
              }
              throw error
            })
          ),
          ...toRemove.map((componentId) =>
            removeFromComponent({
              composerId: String(state.entityId),
              componentId,
            })
          ),
        ]

        await Promise.all(promises)
        return
      }

      const isRelationshipField = fieldKeyString in RELATIONSHIP_KEYS

      if (isRelationshipField) {
        const relationshipKey = fieldKeyString as GlobalRelationshipKey
        const relationshipEndpoint = getRelationshipEndpoint(relationshipKey)

        const entityRecord = currentEntity as Record<string, ValidAdminValue | undefined>
        const currentValue = Object.prototype.hasOwnProperty.call(entityRecord, fieldKeyString)
          ? entityRecord[fieldKeyString]
          : undefined
        const oldValues = Array.isArray(currentValue)
          ? currentValue.map((v) => String(v))
          : currentValue
            ? [String(currentValue)]
            : []

        const rawValue = state.value.value
        const plainValue = toRaw(rawValue)
        const newValues = Array.isArray(plainValue)
          ? plainValue.map((v) => String(v))
          : plainValue
            ? [String(plainValue)]
            : []

        const parentId = String(state.entityId)
        const toAdd = newValues.filter((v) => !oldValues.includes(v))
        const toRemove = oldValues.filter((v) => !newValues.includes(v))

        const promises: Promise<void>[] = [
          ...toAdd.map((childId) => {
            const payload: CreateRelationshipPayload = {
              parent_id: parentId as GlobalEntityId,
              child_id: childId as GlobalEntityId,
            }
            return apiClient.post(relationshipEndpoint, payload).then(() => void 0)
          }),
          ...toRemove.map((childId) => {
            const deleteEndpoint = getRelationshipByParentChildEndpoint(relationshipKey, parentId, childId)
            return apiClient.delete(deleteEndpoint).then(() => void 0)
          }),
        ]

        await Promise.all(promises)

        if (relationshipKey === 'validCascades' || relationshipKey === 'validConstituents') {
          try {
            const { cleanupInvalidActiveRelationships } = await import('@/utils/dependencyCleanup')
            await cleanupInvalidActiveRelationships(
              state.entityKey,
              state.entityId,
              relationshipKey,
              newValues as GlobalEntityId[],
              state.queryClient
            )
          } catch (error) {
            // Dependency cleanup failed (non-critical)
          }
        }

        state.queryClient.invalidateQueries({ queryKey: [relationshipKey] })
        state.queryClient.invalidateQueries({ queryKey: [state.entityKey] })
        await state.queryClient.refetchQueries({ queryKey: ['globalData'] })

        if (['blockInstance', 'blockShape'].includes(state.entityKey)) {
          state.queryClient.invalidateQueries({ queryKey: ['schedulerAdmin'] })
        }
      } else {
        const rawValue = state.value.value
        const plainValue = toRaw(rawValue)

        const patchPayload = {
          admin: {
            key: String(state.fieldKey),
            value: plainValue as ValidAdminValue,
          },
          dynamicId: String(state.entityId),
        }

        await state.patchFieldAsync(patchPayload)

        state.queryClient.invalidateQueries({ queryKey: [state.entityKey] })
        if (['blockInstance', 'blockShape'].includes(state.entityKey)) {
          state.queryClient.invalidateQueries({ queryKey: ['schedulerAdmin'] })
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const is404Error = errorMessage.includes('404') || errorMessage.includes('not found')

      if (is404Error) {
        state.queryClient.invalidateQueries({ queryKey: [state.entityKey] })
        state.queryClient.invalidateQueries({ queryKey: ['globalData'] })

        const originalValue = state.entityValue.value
        state.handleChange(originalValue)

        throw new Error(`This ${state.entityKey} was deleted or no longer exists. The page will refresh automatically.`)
      }
      throw error
    }
  }

  const reset = (): void => {
    const currentEntityValue = state.entityValue.value
    state.handleChange(currentEntityValue)
  }

  const getValue = (): ValidAdminValue => state.value.value

  const setValue = (newValue: ValidAdminValue): void => {
    state.setValue(newValue) // Use the actual setValue from useField (per vee-validate docs)
  }

  return {
    setFocus,
    validate,
    clearError,
    save,
    reset,
    getValue,
    setValue,
  }
}


