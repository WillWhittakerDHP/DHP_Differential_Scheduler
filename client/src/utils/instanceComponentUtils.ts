/**
 * WHY: Service Component Utilities

WHY: Avoids code duplication between compos...
 */
import { getIcon } from './iconMapper'
import type { GlobalEntity } from '@/types/entities'
import type { ComponentItem } from '@/components/booking/types/selectionCardTypes'

export function extractInstanceComponents(params: {
  serviceId: string
  instanceComponentsRelationships: Array<{ childId: string }>
  getGlobalEntityById: (
    entityKey: 'blockInstance' | 'blockShape',
    id: string
  ) => GlobalEntity<'blockInstance'> | GlobalEntity<'blockShape'> | null
}): ComponentItem[] {
  const {
    instanceComponentsRelationships,
    getGlobalEntityById
  } = params

  if (!instanceComponentsRelationships || instanceComponentsRelationships.length === 0) {
    return []
  }

  return instanceComponentsRelationships
    .map(ac => {
      const componentBlockInstance = getGlobalEntityById('blockInstance', ac.childId)
      if (!componentBlockInstance) return null

      const componentWithShapeRef = componentBlockInstance as GlobalEntity<'blockInstance'> & { blockShapeRef: string }
      const componentBlockShape = getGlobalEntityById('blockShape', componentWithShapeRef.blockShapeRef)
      if (!componentBlockShape) return null

      const componentBlockShapeWithComposable = componentBlockShape as GlobalEntity<'blockShape'> & { composable?: boolean }
      if (componentBlockShapeWithComposable.composable !== true) return null

      const componentWithIcon = componentBlockInstance as GlobalEntity<'blockInstance'> & {
        icon?: string
      }

      const rawIcon = componentWithIcon.icon
      const iconValue = rawIcon !== undefined && rawIcon !== null && rawIcon !== '' ? rawIcon : ''
      const mappedIcon = getIcon(iconValue)

      return {
        id: componentBlockInstance.id,
        name: componentBlockInstance.name,
        icon: mappedIcon,
        active: true // All components from instanceComponents are active
      }
    })
    .filter((component): component is NonNullable<typeof component> => component !== null)
}

/**
 * WHY: Check if a service is composable

LEARNING: Pure function that checks if...
 */
export function isServiceComposable(params: {
  serviceId: string
  getGlobalEntityById: (
    entityKey: 'blockInstance' | 'blockShape',
    id: string
  ) => GlobalEntity<'blockInstance'> | GlobalEntity<'blockShape'> | null
}): boolean {
  const { serviceId, getGlobalEntityById } = params

  const globalBlockInstance = getGlobalEntityById('blockInstance', serviceId)
  if (!globalBlockInstance) return false

  const blockInstanceWithShapeRef = globalBlockInstance as GlobalEntity<'blockInstance'> & { blockShapeRef: string }
  const blockShape = getGlobalEntityById('blockShape', blockInstanceWithShapeRef.blockShapeRef)
  if (!blockShape) return false

  const blockShapeWithComposable = blockShape as GlobalEntity<'blockShape'> & { composable?: boolean }
  return blockShapeWithComposable.composable === true
}

