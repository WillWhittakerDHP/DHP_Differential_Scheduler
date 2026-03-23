/**
 * Early exits for field-context persist (unsaved/new entity id, placeholder UUID, not dirty).
 */
export function shouldSkipFieldContextPersist(
  isDirty: boolean,
  entityIdString: string,
  newEntityIdPrefix: string,
  nullUuid: string
): boolean {
  if (!isDirty) {
    return true
  }
  if (entityIdString.startsWith(newEntityIdPrefix)) {
    return true
  }
  if (entityIdString === nullUuid) {
    return true
  }
  return false
}
