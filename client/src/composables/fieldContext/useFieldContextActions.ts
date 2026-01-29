import type { AxiosError } from 'axios'
import type { GlobalEntityKey } from '@/constants/entities'
import { RELATIONSHIP_KEYS } from '@/constants/relationships'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import { getEntityByIdEndpoint } from '@/utils/api'
import apiClient from '@/utils/api'
import type { UseFieldContextStateReturn } from './useFieldContextState'
import {
  saveComponentEntityField,
  saveRelationshipField,
  saveRegularField
} from './useFieldContextSaveHelpers'

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
 * NOTE: This preserves existing behavior; it's mainly a mechanical extraction to reduce file size.
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

      // LEARNING: Route to appropriate save handler based on field type
      // WHY: Different field types require different save logic
      // PATTERN: Check field type and delegate to specialized save function
      if (state.composedEntityComposable) {
        await saveComponentEntityField({
          state,
          currentEntity
        })
        return
      }

      const isRelationshipField = fieldKeyString in RELATIONSHIP_KEYS

      if (isRelationshipField) {
        await saveRelationshipField({
          state,
          currentEntity,
          fieldKeyString,
          queryClient: state.queryClient
        })
      } else {
        await saveRegularField({
          state,
          queryClient: state.queryClient
        })
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
