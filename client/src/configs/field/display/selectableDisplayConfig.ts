export type { SelectableDisplayType } from './selectableDisplayConfigTypes'

import type { SelectableDisplayTypeSuite } from './selectableDisplayConfigTypes'
import { selectableDisplayBlockInstanceSection } from './selectableDisplayConfigBlockInstance'
import { selectableDisplayBlockShapeSection } from './selectableDisplayConfigBlockShape'
import { selectableDisplayPartsAndPlaceholderSection } from './selectableDisplayConfigPartsAndPlaceholders'

export function buildSelectableDisplayType(): SelectableDisplayTypeSuite {
  return {
    ...selectableDisplayBlockInstanceSection,
    ...selectableDisplayBlockShapeSection,
    ...selectableDisplayPartsAndPlaceholderSection,
  } as SelectableDisplayTypeSuite
}
