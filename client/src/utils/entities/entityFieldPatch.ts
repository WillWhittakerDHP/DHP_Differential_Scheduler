
export function createEntityFieldPatch<
  GlobalEntityType extends Record<string, unknown>,
  GlobalPropertyKey extends keyof GlobalEntityType
>(fieldKey: GlobalPropertyKey, value: GlobalEntityType[GlobalPropertyKey]): Partial<GlobalEntityType> {
  const patch: Partial<GlobalEntityType> = {}
  patch[fieldKey] = value
  return patch
}


