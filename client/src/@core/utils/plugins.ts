import type { App } from 'vue'


export const registerPlugins = (app: App) => {
  const imports = import.meta.glob<{ default?: (app: App) => void }>(['../../plugins/*.{ts,js}', '../../plugins/*/index.{ts,js}'], { eager: true })

  const importPaths = Object.keys(imports).sort()

  importPaths.forEach(path => {
    try {
      const pluginImportModule = imports[path]

      if (pluginImportModule?.default && typeof pluginImportModule.default === 'function') {
        pluginImportModule.default(app)
      }
    } catch (error) {
    }
  })
}
