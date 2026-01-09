import type { GlobalEntityKey } from '@/constants/entities'

export function getEntityTypeName(entityKey: GlobalEntityKey): string {
  return entityKey === 'blockShape'
    ? 'BlockShape'
    : entityKey === 'partShape'
      ? 'PartShape'
      : entityKey === 'blockInstance'
        ? 'BlockInstance'
        : 'PartInstance'
}

export function getEntitySuccessMessage(entityKey: GlobalEntityKey): string {
  return `${getEntityTypeName(entityKey)} updated successfully`
}

export function getEntityDeleteTitle(entityKey: GlobalEntityKey): string {
  return `Delete ${getEntityTypeName(entityKey)}`
}


