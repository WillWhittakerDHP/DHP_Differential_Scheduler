import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import type { FieldMetadataEntry } from './fieldMetadataPanels'
import type { SubPanelKey } from './fieldMetadataPanels'

export const FIELD_VISIBILITY = {
  TITLE_ROW: 'titleRow' as const satisfies FieldMetadataEntry['visibility'],
  STATIC_AS_TITLE: 'staticAsTitle' as const satisfies FieldMetadataEntry['visibility'],
  EXPANDED_DIRECT: 'expandedDirect' as const satisfies FieldMetadataEntry['visibility'],
  EXPANDED_PANEL: 'expandedPanel' as const satisfies FieldMetadataEntry['visibility'],
  HIDDEN: 'hidden' as const satisfies FieldMetadataEntry['visibility'],
  NOT_CONFIGURED: 'notConfigured' as const satisfies FieldMetadataEntry['visibility'],
} as const

export const FIELD_LAYOUT = {
  INLINE: 'inline' as const satisfies FieldMetadataEntry['layout'],
  STACKED: 'stacked' as const satisfies FieldMetadataEntry['layout'],
} as const

export const FIELD_RENDER_AS = {
  TEXT: 'text' as const satisfies FieldMetadataEntry['renderAs'],
  NUMBER: 'number' as const satisfies FieldMetadataEntry['renderAs'],
  SELECT: 'select' as const satisfies FieldMetadataEntry['renderAs'],
  MULTISELECT: 'multiselect' as const satisfies FieldMetadataEntry['renderAs'],
  REFERENCE: 'reference' as const satisfies FieldMetadataEntry['renderAs'],
  STATUS_BUTTON: 'statusButton' as const satisfies FieldMetadataEntry['renderAs'],
  ICON_SELECT: 'iconSelect' as const satisfies FieldMetadataEntry['renderAs'],
  RELATIONSHIP_COLLECTION: 'relationshipCollection' as const satisfies FieldMetadataEntry['renderAs'],
} as const

export const FIELD_PANEL = {
  NONE: 'none' as const,
  PARTS: 'parts' as const satisfies SubPanelKey,
  RELATIONSHIPS: 'relationships' as const satisfies SubPanelKey,
  ANNOTATIONS: FIELD_NAMES.ANNOTATIONS satisfies SubPanelKey,
  EVENTS: 'events' as const satisfies SubPanelKey,
  COMPOSITION: 'composition' as const satisfies SubPanelKey,
} as const

export const FIELD_LOCATION_TYPE = {
  TITLE_ROW: 'titleRow',
  DIRECT_INLINE: 'directInline',
  DIRECT_STACKED: 'directStacked',
  SUB_PANEL: 'subPanel',
  HIDDEN: 'hidden',
} as const
