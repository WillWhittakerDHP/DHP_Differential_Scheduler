import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { FieldMetadataEntry } from '@/constants/fieldMetadata'
import {
  FIELD_LOCATION_TYPE,
  SUB_PANEL_KEYS,
  createEmptySubPanelRecord,
  type SubPanelRecord,
} from '@/constants/fieldMetadata'
import { sortFieldsByDisplayOrder } from '@/utils/forms/fieldSorting'
import type { FieldLocation, FieldLocationContext } from '@/types/forms/fieldLocationDispatcher'
import { fieldLocationFromMetadata } from '@/utils/forms/fieldLocationFromMetadata'

function accumulateFieldIntoLocationGroup<GE extends GlobalEntityKey>(
  acc: {
    titleRow: GlobalFieldKey<GE>[]
    directInline: GlobalFieldKey<GE>[]
    directStacked: GlobalFieldKey<GE>[]
    subPanels: SubPanelRecord<GlobalFieldKey<GE>[]>
    hidden: GlobalFieldKey<GE>[]
  },
  fieldKey: GlobalFieldKey<GE>,
  fieldMetadata: Record<string, FieldMetadataEntry>,
  context: FieldLocationContext
): typeof acc {
  const metadata = fieldMetadata[String(fieldKey)]
  const location: FieldLocation = !metadata
    ? { type: FIELD_LOCATION_TYPE.HIDDEN, reason: 'notConfigured' }
    : fieldLocationFromMetadata(fieldKey, metadata, context)

  switch (location.type) {
    case FIELD_LOCATION_TYPE.TITLE_ROW:
      return { ...acc, titleRow: [...acc.titleRow, fieldKey] }
    case FIELD_LOCATION_TYPE.DIRECT_INLINE:
      return { ...acc, directInline: [...acc.directInline, fieldKey] }
    case FIELD_LOCATION_TYPE.DIRECT_STACKED:
      return { ...acc, directStacked: [...acc.directStacked, fieldKey] }
    case FIELD_LOCATION_TYPE.SUB_PANEL:
      return {
        ...acc,
        subPanels: {
          ...acc.subPanels,
          [location.panel]: [...acc.subPanels[location.panel], fieldKey],
        },
      }
    case FIELD_LOCATION_TYPE.HIDDEN:
      return { ...acc, hidden: [...acc.hidden, fieldKey] }
    default:
      return acc
  }
}

export function groupFieldsByLocation<GE extends GlobalEntityKey>(
  fieldKeys: GlobalFieldKey<GE>[],
  fieldMetadata: Record<string, FieldMetadataEntry>,
  context: FieldLocationContext
): {
  titleRow: GlobalFieldKey<GE>[]
  directInline: GlobalFieldKey<GE>[]
  directStacked: GlobalFieldKey<GE>[]
  subPanels: SubPanelRecord<GlobalFieldKey<GE>[]>
  hidden: GlobalFieldKey<GE>[]
} {
  const emptySubPanels = createEmptySubPanelRecord<GlobalFieldKey<GE>[]>(() => [])

  const grouped = fieldKeys.reduce(
    (acc, fieldKey) => accumulateFieldIntoLocationGroup(acc, fieldKey, fieldMetadata, context),
    {
      titleRow: [] as GlobalFieldKey<GE>[],
      directInline: [] as GlobalFieldKey<GE>[],
      directStacked: [] as GlobalFieldKey<GE>[],
      subPanels: { ...emptySubPanels },
      hidden: [] as GlobalFieldKey<GE>[],
    }
  )

  const sortedSubPanels = SUB_PANEL_KEYS.reduce<SubPanelRecord<GlobalFieldKey<GE>[]>>(
    (acc, key) => ({
      ...acc,
      [key]: sortFieldsByDisplayOrder(grouped.subPanels[key], fieldMetadata),
    }),
    createEmptySubPanelRecord<GlobalFieldKey<GE>[]>(() => [])
  )

  return {
    titleRow: sortFieldsByDisplayOrder(grouped.titleRow, fieldMetadata),
    directInline: sortFieldsByDisplayOrder(grouped.directInline, fieldMetadata),
    directStacked: sortFieldsByDisplayOrder(grouped.directStacked, fieldMetadata),
    subPanels: sortedSubPanels,
    hidden: sortFieldsByDisplayOrder(grouped.hidden, fieldMetadata),
  }
}
