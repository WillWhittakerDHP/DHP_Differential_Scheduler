/**
 * Relationship API endpoint builders
 * WHY: Single place for relationship and batch endpoints; reduces api.ts export count
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

export function getBlockInstanceAnnotationsEndpoint(blockInstanceId: string): string {
  return `/relationships/annotationAssignments?blockInstanceId=${blockInstanceId}`
}

export function getBlockInstanceAnnotationEndpoint(blockInstanceId: string, annotationId: string): string {
  return `/relationships/annotationAssignments/${blockInstanceId}/${annotationId}`
}
