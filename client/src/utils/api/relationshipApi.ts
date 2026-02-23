/**
 * Relationship API endpoint builders
 */

export function getRelationshipEndpoint(relationshipKey: string): string {
  return `/relationships/${relationshipKey}`
}

export function getRelationshipByParentChildEndpoint(
  relationshipKey: string,
  parentId: string,
  childId: string
): string {
  return `/relationships/${relationshipKey}/${parentId}/${childId}`
}

export function getRelationshipsBatchEndpoint(): string {
  return '/relationships/batch'
}
