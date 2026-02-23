/**
 * WHY: Admin Config Composable for Vue

     This allows Vue components to dyna...
 */
import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FormFieldConfig, FormFieldConfigMap } from '@/types/entity/formFields'
import type { DisplayFieldConfigMap } from '@/configs/field/display/fullFieldDisplayConfig'
import type { InstanceConfig } from '@/configs/adminConfig'

import { getAdminConfig, rebuildAdminConfig, type AdminConfig } from '../configs/adminConfig'
import { createLogger } from '@/utils/logger'

const logger = createLogger('useAdminConfig')

const formFieldConfigCache = new Map<
  string,
  ComputedRef<FormFieldConfig<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>> | undefined>
>()
const displayFieldConfigCache = new Map<string, ComputedRef<unknown>>()
const entityFormFieldConfigCache = new Map<string, ComputedRef<FormFieldConfigMap[GlobalEntityKey]>>()
const entityDisplayFieldConfigCache = new Map<string, ComputedRef<Record<string, unknown>>>()
const instanceConfigCache = new Map<string, ComputedRef<InstanceConfig[GlobalEntityKey]>>()

const createCacheKey = (entityKey: string, fieldKey?: string): string => {
  return fieldKey ? `${entityKey}:${fieldKey}` : entityKey
}

/**
 * WHY: Clear all caches (for testing)
LEARNING: Module-level caches persist acr...
 */
export function _clearCache(): void {
  formFieldConfigCache.clear()
  displayFieldConfigCache.clear()
  entityFormFieldConfigCache.clear()
  entityDisplayFieldConfigCache.clear()
  instanceConfigCache.clear()
}

/**
 * PATTERN: Admin config composable

PATTERN: Composable that returns computed value...
 */
export function useAdminConfig() {
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

  /**
   */
  const rebuildConfig = (): void => {
    rebuildAdminConfig()
  }

  /**
   */
  const getFormFieldConfig = <GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
    entityKey: GE,
    fieldKey: FieldKey
  ): ComputedRef<FormFieldConfig<GE, FieldKey> | undefined> => {
    throw new Error(
      `[useAdminConfig] DEPRECATED: getFormFieldConfig(${String(entityKey)}, ${String(fieldKey)}) called. ` +
      `Form field configs are now metadata-only. Use /admin-input-metadata and metadata.inputConfig instead. ` +
      `This method has been removed - update caller to use metadata instead.`
    )
  }

  /**
   */
  const getEntityFormFieldConfig = <GE extends GlobalEntityKey>(
    entityKey: GE
  ): ComputedRef<FormFieldConfigMap[GE]> => {
    throw new Error(
      `[useAdminConfig] DEPRECATED: getEntityFormFieldConfig(${String(entityKey)}) called. ` +
      `Form field configs are now metadata-only. Use /admin-input-metadata instead. ` +
      `This method has been removed - update caller to use metadata instead.`
    )
  }

  /**
   */
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

  /**
   */
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

  /**
   */
  const getInstanceConfig = <GE extends GlobalEntityKey>(
    entityKey: GE
  ): ComputedRef<InstanceConfig[GE]> => {
    const cacheKey = createCacheKey(String(entityKey))
    
    if (instanceConfigCache.has(cacheKey)) {
      return instanceConfigCache.get(cacheKey)! as ComputedRef<InstanceConfig[GE]>
    }
    
    const computedRef = computed(() => {
      try {
        const config = getConfig()
        return (config?.instanceConfig?.[entityKey] || { titleField: 'name' }) as InstanceConfig[GE]
      } catch (_error) {
        logger.error('Failed to get instance config', { error: _error })
        return { titleField: 'name' } as InstanceConfig[GE]
      }
    })
    
    instanceConfigCache.set(cacheKey, computedRef as ComputedRef<InstanceConfig[GlobalEntityKey]>)
    return computedRef
  }

  return {
    getConfig,
    rebuildConfig,
    getFormFieldConfig,
    getEntityFormFieldConfig,
    getDisplayFieldConfig,
    getEntityDisplayFieldConfig,
    getInstanceConfig
  }
}

