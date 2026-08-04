import type { GlobalEntityKey } from '@/constants/entities'

const ENTITY_TYPE_NAMES: Record<GlobalEntityKey, string> = {
  blockShape: 'BlockShape',
  partShape: 'PartShape',
  blockInstance: 'BlockInstance',
  partInstance: 'PartInstance',
  eventShape: 'EventShape',
  eventInstance: 'EventInstance',
  annotationShape: 'AnnotationShape',
  annotationInstance: 'AnnotationInstance',
}

const ENTITY_TYPE_LABELS: Record<GlobalEntityKey, string> = {
  blockShape: 'Block Shapes',
  partShape: 'Part Shapes',
  blockInstance: 'Block Instance',
  partInstance: 'Part Instance',
  eventShape: 'Event Types',
  eventInstance: 'Event Instances',
  annotationShape: 'Annotation Shapes',
  annotationInstance: 'Annotation Instances',
}

function getEntityTypeName(entityKey: GlobalEntityKey): string {
  return ENTITY_TYPE_NAMES[entityKey] ?? entityKey
}

export function getEntityTypeLabel(entityKey: GlobalEntityKey): string {
  return ENTITY_TYPE_LABELS[entityKey] ?? entityKey
}

export function getEntitySuccessMessage(entityKey: GlobalEntityKey): string {
  return `${getEntityTypeName(entityKey)} updated successfully`
}

export function getEntityCreateMessage(entityKey: GlobalEntityKey): string {
  return `${getEntityTypeName(entityKey)} created successfully`
}

export function getEntityDeleteTitle(entityKey: GlobalEntityKey): string {
  return `Delete ${getEntityTypeName(entityKey)}`
}


