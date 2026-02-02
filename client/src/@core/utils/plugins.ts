import type { App } from 'vue'
import { createLogger } from '@/utils/logger'

const logger = createLogger('plugins')

export const registerPlugins = (app: App) => {
  const imports = import.meta.glob(['../../plugins/*.{ts,js}', '../../plugins/*/index.{ts,js}'], { eager: true })

  const importPaths = Object.keys(imports).sort()

  importPaths.forEach(path => {
    try {
      const pluginImportModule = imports[path] as { default?: (app: App) => void }

      if (pluginImportModule?.default && typeof pluginImportModule.default === 'function') {
        pluginImportModule.default(app)
      }
    } catch (error) {
      logger.warn('Failed to register plugin', { error, path })
    }
  })
}
