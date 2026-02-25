export type DehydrateFieldSets = {
  requiredFields: Set<string>
  nullableBooleanFields: Set<string>
  nonNullableBooleanFields: Set<string>
  requiredNumberFields: Set<string>
}
