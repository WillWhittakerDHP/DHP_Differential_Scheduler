import { BlockInstance } from '../../../config/app.js'
import { RELATIONSHIP_TYPES } from '../../../constants/relationshipTypes.js'
import { type RelationshipKind } from './relationshipConstants.js'

type MapRelationshipFieldOptions = {
  userTypeBlockInstanceId?: string | null
}

function mapAnnotationAssignmentsFields(
  parentId: string,
  childId: string,
  userTypeBlockInstanceId?: string | null
): Record<string, unknown> {
  const userType =
    userTypeBlockInstanceId === undefined || userTypeBlockInstanceId === ''
      ? null
      : userTypeBlockInstanceId
  return {
    blockInstanceId: parentId,
    annotationId: childId,
    userTypeBlockInstanceId: userType,
  }
}

function mapAttendeeAssignmentsFields(
  parentId: string,
  childId: string
): Record<string, string> {
  return {
    eventShapeId: parentId,
    userTypeBlockInstanceId: childId,
  }
}

async function mapEventAssignmentsFields(
  parentId: string,
  childId: string
): Promise<Record<string, string>> {
  const blockInstance = await BlockInstance.findByPk(parentId)
  if (blockInstance) {
    return { parentId, parentKind: 'blockInstance', childId }
  }
  throw new Error(`Parent ID ${parentId} is not a valid BlockInstance for eventAssignments`)
}

export async function mapRelationshipFields(
  relationshipKind: RelationshipKind,
  parentId: string,
  childId: string,
  options?: MapRelationshipFieldOptions
): Promise<Record<string, unknown>> {
  switch (relationshipKind) {
    case RELATIONSHIP_TYPES.ANNOTATION_ASSIGNMENTS:
      return mapAnnotationAssignmentsFields(parentId, childId, options?.userTypeBlockInstanceId)
    case RELATIONSHIP_TYPES.ATTENDEE_ASSIGNMENTS:
      return mapAttendeeAssignmentsFields(parentId, childId)
    case RELATIONSHIP_TYPES.EVENT_ASSIGNMENTS:
      return mapEventAssignmentsFields(parentId, childId)
    default:
      return { parentId, childId }
  }
}
