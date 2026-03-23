/**
 * WHY: Admin Config Composable for Vue

     This allows Vue components to dyna...
 */
import { computed, type ComputedRef } from 'vue'
import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { InstanceConfig } from '@/configs/adminConfig'
import { rebuildAdminConfig, type AdminConfig } from '../configs/adminConfig'
import { createLogger } from '@/utils/logger'
import { loadAdminConfigSingleton } from '@/utils/admin/adminConfigLoader'

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

const singletonHolder: { current: AdminConfig | null } = { current: null }

const createCacheKey = (entityKey: string, fieldKey?: string): string =>
  fieldKey ? `${entityKey}:${fieldKey}` : entityKey

function getOrCreateDisplayFieldComputed<GE extends GlobalEntityKey, FieldKey extends GlobalFieldKey<GE>>(
  entityKey: GE,
  fieldKey: FieldKey
): ComputedRef<unknown> {
  const cacheKey = createCacheKey(String(entityKey), String(fieldKey))
  const hit = displayFieldConfigCache.get(cacheKey)
  if (hit) return hit
  const computedRef = computed(() => {
    const config = loadAdminConfigSingleton(singletonHolder)
    return config?.displayFieldConfig?.[entityKey]?.[fieldKey as GlobalFieldKey<GE>]
  })
  displayFieldConfigCache.set(cacheKey, computedRef)
  return computedRef
}

function getOrCreateEntityDisplayComputed<GE extends GlobalEntityKey>(
  entityKey: GE
): ComputedRef<Record<string, unknown>> {
  const cacheKey = createCacheKey(String(entityKey))
  const hit = entityDisplayFieldConfigCache.get(cacheKey)
  if (hit) return hit
  const computedRef = computed(() => {
    const config = loadAdminConfigSingleton(singletonHolder)
    if (!config?.displayFieldConfig?.[entityKey]) {
      throw new Error(
        `[useAdminConfig] Missing displayFieldConfig for ${String(entityKey)}. ` +
          `Display field config must be configured.`
      )
    }
    return config.displayFieldConfig[entityKey] as Record<string, unknown>
  })
  entityDisplayFieldConfigCache.set(cacheKey, computedRef)
  return computedRef
}

function getOrCreateInstanceConfigComputed<GE extends GlobalEntityKey>(
  entityKey: GE
): ComputedRef<InstanceConfig[GlobalEntityKey]> {
  const cacheKey = createCacheKey(String(entityKey))
  const hit = instanceConfigCache.get(cacheKey)
  if (hit) return hit
  const computedRef = computed((): InstanceConfig[GlobalEntityKey] => {
    try {
      const config = loadAdminConfigSingleton(singletonHolder)
      return (config?.instanceConfig?.[entityKey] || { titleField: 'name' }) as InstanceConfig[GE]
    } catch (error) {
      logger.error('Failed to get instance config', { error })
      return { titleField: 'name' } as InstanceConfig[GlobalEntityKey]
    }
  })
  instanceConfigCache.set(cacheKey, computedRef)
  return computedRef
}

/**
 * PATTERN: Admin config composable

PATTERN: Composable that returns computed value...
 */
export function useAdminConfig(): UseAdminConfigReturn {
  const getConfig = (): AdminConfig => loadAdminConfigSingleton(singletonHolder)

  const rebuildConfig = (): void => {
    singletonHolder.current = null
    displayFieldConfigCache.clear()
    entityDisplayFieldConfigCache.clear()
    instanceConfigCache.clear()
    rebuildAdminConfig()
  }

  return {
    getConfig,
    rebuildConfig,
    getDisplayFieldConfig: getOrCreateDisplayFieldComputed,
    getEntityDisplayFieldConfig: getOrCreateEntityDisplayComputed,
    getInstanceConfig: getOrCreateInstanceConfigComputed,
  }
}
