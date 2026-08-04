import type { PropertyFactKey } from '@shared/constants/accumulator'

const selectedFactByParentChild = new Map<string, PropertyFactKey>()

function parentChildKey(parentId: string, childId: string): string {
  return `${parentId}::${childId}`
}

export function setAccumulationLinkChildFactKey(
  parentId: string,
  childId: string,
  factKey: PropertyFactKey
): void {
  if (childId.trim().length === 0) {
    return
  }
  selectedFactByParentChild.set(parentChildKey(parentId, childId), factKey)
}

export function getAccumulationLinkChildFactKey(parentId: string, childId: string): PropertyFactKey {
  if (childId.trim().length === 0) {
    return ''
  }
  return selectedFactByParentChild.get(parentChildKey(parentId, childId)) ?? ''
}
