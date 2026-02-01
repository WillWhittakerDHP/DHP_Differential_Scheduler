/**
 * LEARNING: Admin Config Composable for Vue
 * 
 * WHY: Provides access to admin configuration built specifically for Vue
 *      This allows Vue components to dynamically generate fields based on configs
 * 
 * PATTERN: Composable that provides reactive access to Vue admin config
 * 
 * COMPARISON: React uses direct import of adminConfig. Vue uses composable pattern
 *             for reactive access and better integration with Vue's reactivity system.
 */

import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FormFieldConfig, FormFieldConfigMap } from '@/types/entity/formFields'
import type { DisplayFieldConfigMap } from '@/configs/field/display/fullFieldDisplayConfig'
import type { InstanceConfig } from '@/configs/adminConfig'

import { getAdminConfig, rebuildAdminConfig, type AdminConfig } from '../configs/adminConfig'

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
 * Clear all caches (for testing)
 * LEARNING: Module-level caches persist across tests, causing stale state
 * WHY: Tests need to start with fresh caches to ensure isolation
 */
export function _clearCache(): void {
  formFieldConfigCache.clear()
  displayFieldConfigCache.clear()
  entityFormFieldConfigCache.clear()
  entityDisplayFieldConfigCache.clear()
  instanceConfigCache.clear()
}

/**
 * Admin config composable
 * 
 * LEARNING: Provides reactive access to admin configuration
 * WHY: Components need to read field configs to determine field types and rendering
 * PATTERN: Composable that returns computed values for reactive access
 */
export function useAdminConfig() {
  /**
   * LEARNING: Get admin config (lazy initialized)
   * WHY: Config is built once and cached
   * PATTERN: Direct access to singleton config instance
   * FIX: Cache the config reference to avoid calling getAdminConfig() on every computed access
   *      Since the config is a singleton and doesn't change, we can get it once and reuse it
   */
  let cachedConfig: AdminConfig | null = null
  const getConfig = (): AdminConfig => {
    // FIX: Only call getAdminConfig() once, then reuse the cached reference
    if (!cachedConfig) {
      try {
        cachedConfig = getAdminConfig()
      } catch (error) {
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
   * LEARNING: Rebuild admin config after field keys are loaded
   * WHY: Dynamic fields need to be included in field configs
   * PATTERN: Call rebuild when FIELD_KEYS are initialized
   */
  const rebuildConfig = (): void => {
    rebuildAdminConfig()
  }

  /**
   * LEARNING: Get form field config for a specific entity and field (REMOVED - Metadata-only)
   * WHY: Form field configs are now metadata-only - all configuration comes from /admin-input-metadata
   * PATTERN: Throws error - use metadata.inputConfig instead
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
   * LEARNING: Get all form field configs for an entity (REMOVED - Metadata-only)
   * WHY: Form field configs are now metadata-only - all configuration comes from /admin-input-metadata
   * PATTERN: Throws error - use metadata instead
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
   * LEARNING: Get display field config for a specific entity and field
   * WHY: FieldRenderer needs display config for labels, placeholders, etc.
   * PATTERN: Type-safe accessor with computed for reactive access, cached to avoid duplicate computeds
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
   * LEARNING: Get all display field configs for an entity
   * WHY: DynamicFormInputs needs display configs for all fields
   * PATTERN: Return computed object with all display configs, cached to avoid duplicate computeds
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
   * LEARNING: Get instance config for an entity
   * WHY: Need to know which fields to omit, inline, stack, etc.
   * PATTERN: Type-safe accessor with computed for reactive access, cached to avoid duplicate computeds
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
      } catch (error) {
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

