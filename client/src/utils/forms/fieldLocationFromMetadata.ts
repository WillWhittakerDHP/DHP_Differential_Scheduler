import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import {
  FIELD_LOCATION_TYPE,
  FIELD_VISIBILITY,
  FIELD_LAYOUT,
  SUB_PANEL_KEYS,
  type SubPanelKey,
} from '@/constants/fieldMetadata'
import { determinePanelFromFieldKey } from '@/utils/forms/fieldPanelFromKey'
import type { FieldLocation, FieldLocationContext } from '@/types/forms/fieldLocationDispatcher'

const VALID_PANELS = new Set<SubPanelKey>(SUB_PANEL_KEYS)

function hiddenLocation(reason: Extract<FieldLocation, { type: 'hidden' }>['reason']): FieldLocation {
  return { type: FIELD_LOCATION_TYPE.HIDDEN, reason }
}

function titleRowLocation(reason: 'titleRow' | 'staticAsTitle'): FieldLocation {
  return { type: FIELD_LOCATION_TYPE.TITLE_ROW, reason }
}

function expandedDirectLocation(
  isExpanded: boolean,
  layout: FieldMetadataEntry['layout']
): FieldLocation {
  if (!isExpanded) {
    return hiddenLocation('notExpanded')
  }
  if (layout === FIELD_LAYOUT.INLINE) {
    return { type: FIELD_LOCATION_TYPE.DIRECT_INLINE, reason: 'expandedDirect' }
  }
  return { type: FIELD_LOCATION_TYPE.DIRECT_STACKED, reason: 'expandedDirect' }
}

function isValidSubPanelKey(p: string): p is SubPanelKey {
  return VALID_PANELS.has(p as SubPanelKey)
}

function expandedPanelLocation<GE extends GlobalEntityKey>(
  fieldKey: GlobalFieldKey<GE>,
  fieldMetadata: FieldMetadataEntry,
  context: FieldLocationContext
): FieldLocation {
  if (!context.isExpanded) {
    return hiddenLocation('notExpanded')
  }
  const fieldKeyString = String(fieldKey)
  const determinedPanel = determinePanelFromFieldKey(fieldKeyString)
  const panelToUse = determinedPanel !== 'none' ? determinedPanel : fieldMetadata.panel
  if (panelToUse && isValidSubPanelKey(panelToUse)) {
    return { type: FIELD_LOCATION_TYPE.SUB_PANEL, panel: panelToUse, reason: 'expandedPanel' }
  }
  return hiddenLocation('notConfigured')
}

export function fieldLocationFromMetadata<GE extends GlobalEntityKey>(
  fieldKey: GlobalFieldKey<GE>,
  fieldMetadata: FieldMetadataEntry,
  context: FieldLocationContext
): FieldLocation {
  const { visibility, layout } = fieldMetadata

  switch (visibility) {
    case FIELD_VISIBILITY.TITLE_ROW:
      return titleRowLocation('titleRow')
    case FIELD_VISIBILITY.STATIC_AS_TITLE:
      return titleRowLocation('staticAsTitle')
    case FIELD_VISIBILITY.HIDDEN:
      return hiddenLocation('hidden')
    case FIELD_VISIBILITY.NOT_CONFIGURED:
      return hiddenLocation('notConfigured')
    case FIELD_VISIBILITY.EXPANDED_DIRECT:
      return expandedDirectLocation(context.isExpanded, layout)
    case FIELD_VISIBILITY.EXPANDED_PANEL:
      return expandedPanelLocation(fieldKey, fieldMetadata, context)
    default:
      return hiddenLocation('notConfigured')
  }
}
