/**
 * Named steps for field-context save (verify entity, dispatch mutation, map errors).
 * WHY: Keeps useFieldContextState.save under function-governance thresholds.
 */
import type { AxiosError } from 'axios'
import type { QueryClient } from '@tanstack/vue-query'
import type { GlobalEntityKey } from '@/constants/entities'
import { RELATIONSHIP_KEYS } from '@/constants/relationships'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import { createLogger } from '@/utils/logger'
import { getEntityByIdEndpoint } from '@/utils/api'
import apiClient from '@/utils/api'
import {
  saveComponentEntityField,
  saveRelationshipField,
  saveRegularField,
} from '@/utils/fieldContext/fieldContextSaveHelpers'
import type { UseFieldContextStateReturn } from '@/types/fieldContext/fieldContextState'

const logger = createLogger('fieldContextSaveOrchestration')

async function verifyEntityExistsOnServerForFieldContextCore(
  entityKey: GlobalEntityKey,
  entityIdString: string,
  entityId: GlobalEntityId,
  queryClient: QueryClient
): Promise<void> {
  try {
    const verifyEndpoint = getEntityByIdEndpoint(entityKey, entityIdString)
    await apiClient.get(verifyEndpoint)
  } catch (verifyError: unknown) {
    logger.error('Entity verify failed', { error: verifyError })
    const axiosError = verifyError as AxiosError<{ error?: string; id?: string }>

    if (axiosError.response?.status === 404) {
      queryClient.invalidateQueries({ queryKey: [entityKey] })
      queryClient.invalidateQueries({ queryKey: ['globalData'] })
      throw new Error(
        `Entity ${entityKey} with ID ${entityId} does not exist on server. Cache will be refreshed.`
      )
    }
    throw axiosError
  }
}

export async function verifyEntityExistsOnServerForFieldContext(
  entityKey: GlobalEntityKey,
  entityIdString: string,
  entityId: GlobalEntityId,
  queryClient: QueryClient
): Promise<void> {
  await verifyEntityExistsOnServerForFieldContextCore(entityKey, entityIdString, entityId, queryClient)
}

async function runFieldContextPersistDispatchCore<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  params: {
    state: UseFieldContextStateReturn<GE, FieldKey>
    currentEntity: { id?: string; name?: string; entityKey?: string }
    fieldKey: FieldKey
    validate: () => Promise<boolean>
    queryClient: QueryClient
  }
): Promise<void> {
  const { state, currentEntity, fieldKey, validate, queryClient } = params

  const isValidResult = await validate()
  if (!isValidResult) {
    throw new Error(`Validation failed for field ${String(fieldKey)}`)
  }

  const fieldKeyString = String(fieldKey)

  if (state.composedEntityComposable) {
    await saveComponentEntityField({
      state,
      currentEntity,
    })
    return
  }

  const isRelationshipField = fieldKeyString in RELATIONSHIP_KEYS

  if (isRelationshipField) {
    await saveRelationshipField({
      state,
      currentEntity,
      fieldKeyString,
      queryClient,
    })
  } else {
    await saveRegularField({
      state,
      queryClient,
    })
  }
}

export async function runFieldContextPersistDispatch<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  params: {
    state: UseFieldContextStateReturn<GE, FieldKey>
    currentEntity: { id?: string; name?: string; entityKey?: string }
    fieldKey: FieldKey
    validate: () => Promise<boolean>
    queryClient: QueryClient
  }
): Promise<void> {
  await runFieldContextPersistDispatchCore(params)
}

export async function persistFieldContextAfterServerChecks<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  params: {
    entityKey: GlobalEntityKey
    entityIdString: string
    entityId: GlobalEntityId
    queryClient: QueryClient
    currentEntity: { id?: string; name?: string; entityKey?: string } | undefined
    fieldKey: FieldKey
    state: UseFieldContextStateReturn<GE, FieldKey>
    validate: () => Promise<boolean>
    entityValue: ValidAdminValue
    handleChange: (value: ValidAdminValue) => void
  }
): Promise<void> {
  const {
    entityKey,
    entityIdString,
    entityId,
    queryClient,
    currentEntity,
    fieldKey,
    state,
    validate,
    entityValue,
    handleChange,
  } = params

  await verifyEntityExistsOnServerForFieldContextCore(entityKey, entityIdString, entityId, queryClient)

  if (!currentEntity) {
    throw new Error(
      `Cannot save field ${String(fieldKey)}: Entity ${entityKey} with ID ${entityId} not found in store`
    )
  }

  if (!entityIdString || entityIdString.trim() === '') {
    throw new Error(`Invalid entity ID: ${entityIdString}`)
  }

  try {
    await runFieldContextPersistDispatchCore({
      state,
      currentEntity,
      fieldKey,
      validate,
      queryClient,
    })
  } catch (error: unknown) {
    logger.debug('Field context persist failed; delegating to recovery handler', { error })
    handleFieldContextPersistCatchCore(error, entityKey, queryClient, entityValue, handleChange)
  }
}

function handleFieldContextPersistCatchCore(
  error: unknown,
  entityKey: GlobalEntityKey,
  queryClient: QueryClient,
  entityValue: ValidAdminValue,
  handleChange: (value: ValidAdminValue) => void
): never {
  logger.error('Field context save failed', { error })
  const errorMessage = error instanceof Error ? error.message : String(error)
  const is404Error = errorMessage.includes('404') || errorMessage.includes('not found')

  if (is404Error) {
    queryClient.invalidateQueries({ queryKey: [entityKey] })
    queryClient.invalidateQueries({ queryKey: ['globalData'] })

    const originalValue = entityValue
    handleChange(originalValue)

    throw new Error(`This ${entityKey} was deleted or no longer exists. The page will refresh automatically.`)
  }
  throw error
}

export function handleFieldContextPersistCatch(
  error: unknown,
  entityKey: GlobalEntityKey,
  queryClient: QueryClient,
  entityValue: ValidAdminValue,
  handleChange: (value: ValidAdminValue) => void
): never {
  return handleFieldContextPersistCatchCore(error, entityKey, queryClient, entityValue, handleChange)
}
