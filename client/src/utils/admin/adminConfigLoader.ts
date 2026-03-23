import type { DisplayFieldConfigMap } from '@/configs/field/display/fullFieldDisplayConfig'
import type { FormFieldConfigMap } from '@/types/entity/formFields'
import type { InstanceConfig } from '@/configs/adminConfig'
import { getAdminConfig, type AdminConfig } from '@/configs/adminConfig'
import { createLogger } from '@/utils/logger'

const logger = createLogger('adminConfigLoader')

export function loadAdminConfigSingleton(cached: { current: AdminConfig | null }): AdminConfig {
  if (!cached.current) {
    try {
      cached.current = getAdminConfig()
    } catch (error) {
      logger.error('Failed to get admin config', { error })
      cached.current = {
        displayFieldConfig: {} as DisplayFieldConfigMap,
        formFieldConfig: {} as FormFieldConfigMap,
        instanceConfig: {} as InstanceConfig,
      }
    }
  }
  return cached.current
}
