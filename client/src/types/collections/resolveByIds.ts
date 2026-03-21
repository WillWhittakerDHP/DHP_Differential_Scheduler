export interface ResolveByIdsResult<CollectionItem extends { id: string }> {
  resolved: CollectionItem[]
  missingIds: string[]
}
