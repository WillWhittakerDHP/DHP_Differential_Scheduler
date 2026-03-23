/**
 * WHY: Derive shape entity key + FK property for relationship collection (pure).
 */

import type { GlobalEntityKey } from '@/constants/entities'

export function childEntityKeyToShapeEntityKey(childKey: string): GlobalEntityKey {
  if (childKey.endsWith('Instance')) {
    return childKey.replace('Instance', 'Shape') as GlobalEntityKey
  }
  return childKey.replace('instance', 'shape').replace('Instance', 'Shape') as GlobalEntityKey
}

export function shapeRefPropertyForChild(childEntityKey: string, shapeEntityKey: string): string {
  if (childEntityKey === 'annotationInstance') {
    return 'type'
  }
  const firstLower = shapeEntityKey.charAt(0).toLowerCase() + shapeEntityKey.slice(1)
  return `${firstLower}Ref`
}
