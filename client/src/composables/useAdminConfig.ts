/**
 * WHY: Admin Config Composable for Vue

     This allows Vue components to dyna...
 */
import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { DisplayFieldConfigMap } from '@/configs/field/display/fullFieldDisplayConfig'
import type { FormFieldConfigMap } from '@/types/entity/formFields'
import type { InstanceConfig } from '@/configs/adminConfig'

import { getAdminConfig, rebuildAdminConfig, type AdminConfig } from '../configs/adminConfig'
import { createLogger } from '@/utils/logger'

export interface UseAdminConfigReturn {
  getConfig: () => AdminConfig
  rebuildConfig: () => void
  getDisplayFieldConfig: <GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
    entityKey: GE,
    fieldKey: FieldKey
  ) => ComputedRef<unknown>
  getEntityDisplayFieldConfig: <GE extends GlobalEntityKey>(
    entityKey: GE
  ) => ComputedRef<Record<string, unknown>>
  getInstanceConfig: <GE extends GlobalEntityKey>(
    entityKey: GE
  ) => ComputedRef<InstanceConfig[GlobalEntityKey]>
}

const logger = createLogger('useAdminConfig')

const displayFieldConfigCache = new Map<string, ComputedRef<unknown>>()
const entityDisplayFieldConfigCache = new Map<string, ComputedRef<Record<string, unknown>>>()
const instanceConfigCache = new Map<string, ComputedRef<InstanceConfig[GlobalEntityKey]>>()

const createCacheKey = (entityKey: string, fieldKey?: string): string => {
  return fieldKey ? `${entityKey}:${fieldKey}` : entityKey
}

export function _clearCache(): void {
  displayFieldConfigCache.clear()
  entityDisplayFieldConfigCache.clear()
  instanceConfigCache.clear()
}

/**
 * PATTERN: Admin config composable

PATTERN: Composable that returns computed value...
 */
export function useAdminConfig(): UseAdminConfigReturn {
  /**
   * FIX: Cache the config reference to avoid calling getAdminConfig() on every computed access
   *      Since the config is a singleton and doesn't change, we can get it once and reuse it
   */
  let cachedConfig: AdminConfig | null = null
  const getConfig = (): AdminConfig => {
    // FIX: Only call getAdminConfig() once, then reuse the cached reference
    if (!cachedConfig) {
      try {
        cachedConfig = getAdminConfig()
      } catch (_error) {
        logger.error('Failed to get admin config', { error: _error })
        cachedConfig = {
          displayFieldConfig: {} as DisplayFieldConfigMap,
          formFieldConfig: {} as FormFieldConfigMap,
          instanceConfig: {} as InstanceConfig
        }
      }
    }
    return cachedConfig!
  }

  const rebuildConfig = (): void => {
    rebuildAdminConfig()
  }

  const getDisplayFieldConfig = <GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
    entityKey: GE,
    fieldKey: FieldKey
  ): ComputedRef<unknown> => {
    const cacheKey = createCacheKey(String(entityKey), String(fieldKey))
    
    if (displayFieldConfigCache.has(cacheKey)) {
      return displayFieldConfigCache.get(cacheKey)!
    }
    
    const computedRef = computed(() => {
      const config = getConfig()
      return config?.displayFieldConfig?.[entityKey]?.[fieldKey as GlobalFieldKey<GE>]
    })
    
    displayFieldConfigCache.set(cacheKey, computedRef)
    return computedRef
  }

  const getEntityDisplayFieldConfig = <GE extends GlobalEntityKey>(
    entityKey: GE
  ): ComputedRef<Record<string, unknown>> => {
    const cacheKey = createCacheKey(String(entityKey))
    
    if (entityDisplayFieldConfigCache.has(cacheKey)) {
      return entityDisplayFieldConfigCache.get(cacheKey)!
    }
    
    const computedRef = computed(() => {
      const config = getConfig()
      if (!config?.displayFieldConfig?.[entityKey]) {
        throw new Error(
          `[useAdminConfig] Missing displayFieldConfig for ${String(entityKey)}. ` +
          `Display field config must be configured.`
        )
      }
      return config.displayFieldConfig[entityKey]
    })
    
    entityDisplayFieldConfigCache.set(cacheKey, computedRef)
    return computedRef
  }

  const getInstanceConfig = <GE extends GlobalEntityKey>(
    entityKey: GE
  ): ComputedRef<InstanceConfig[GlobalEntityKey]> => {
    const cacheKey = createCacheKey(String(entityKey))
    const cached = instanceConfigCache.get(cacheKey)
    if (cached) return cached
    const computedRef = computed(() => {
      try {
        const config = getConfig()
        return (config?.instanceConfig?.[entityKey] || { titleField: 'name' }) as InstanceConfig[GlobalEntityKey]
      } catch (_error) {
        logger.error('Failed to get instance config', { error: _error })
        return { titleField: 'name' } as InstanceConfig[GlobalEntityKey]
      }
    })
    instanceConfigCache.set(cacheKey, computedRef)
    return computedRef
  }

  return {
    getConfig,
    rebuildConfig,
    getDisplayFieldConfig,
    getEntityDisplayFieldConfig,
    getInstanceConfig
  }
}

