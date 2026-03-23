import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalEntity } from '@/types/entities'
import { FIELD_VISIBILITY, type FieldMetadataEntry } from '@/constants/fieldMetadata'
import { toGlobalEntityId } from '@/utils/globalEntity'
import type { GlobalEntityId } from '@shared/types/primitiveBrands'

export function annotationInstanceShapeDisplayTitle(
  entityKey: GlobalEntityKey,
  entity: GlobalEntity<GlobalEntityKey>,
  lookupAnnotationShape: (id: GlobalEntityId) => GlobalEntity<'annotationShape'> | undefined
): string {
  if (entityKey !== 'annotationInstance') return ''
  const ann = entity as GlobalEntity<'annotationInstance'>
  if (ann.type == null || String(ann.type) === '') return ''
  const shape = lookupAnnotationShape(toGlobalEntityId(String(ann.type)))
  const n = shape?.name
  return typeof n === 'string' && n.trim() !== '' ? n.trim() : ''
}

export function eventInstanceShapeDisplayTitle(
  entityKey: GlobalEntityKey,
  entity: GlobalEntity<GlobalEntityKey>,
  lookupEventShape: (id: GlobalEntityId) => GlobalEntity<'eventShape'> | undefined
): string {
  if (entityKey !== 'eventInstance') return ''
  const ei = entity as GlobalEntity<'eventInstance'>
  if (ei.eventShapeRef == null || String(ei.eventShapeRef) === '') return ''
  const shape = lookupEventShape(toGlobalEntityId(String(ei.eventShapeRef)))
  const n = shape?.name
  return typeof n === 'string' && n.trim() !== '' ? n.trim() : ''
}

export function expansionFallbackTitleForCard(
  entityKey: GlobalEntityKey,
  annotationShapeTitle: string,
  entityName: string
): string {
  if (entityKey === 'annotationInstance' && annotationShapeTitle !== '') {
    return annotationShapeTitle
  }
  return entityName
}

export function fieldTreatsAsStaticTitleForCard(
  fieldKey: string,
  entityKey: GlobalEntityKey,
  composedFieldMetadata: Record<string, FieldMetadataEntry>
): boolean {
  const vis = composedFieldMetadata[String(fieldKey)]?.visibility
  if (vis !== FIELD_VISIBILITY.STATIC_AS_TITLE) return false
  if (entityKey === 'annotationInstance' && fieldKey === 'text') {
    return false
  }
  return true
}
