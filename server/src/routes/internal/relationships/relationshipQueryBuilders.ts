/**
 * PATTERN: Shared relationship query builders
PATTERN: Pure functions with explicit...
 */
import type { Includeable } from 'sequelize'
import {
  EventInstance,
  EventShape,
  AnnotationInstance,
  AnnotationShape,
  BlockInstance,
} from '../../../config/app.js'
import { getModelAttributes, isModelUnderscored } from '../../../utils/sequelizeHelpers.js'
import { RELATIONSHIP_TYPES } from '../../../constants/relationshipTypes.js'
import { FIELD_NAMES } from '../entities/entityConstants.js'
import type { RelationshipConfig } from './relationshipConstants.js'

const EVENT_ASSIGNMENTS_ATTRIBUTES = [
  'id',
  'name',
  'event_shape_ref',
  'title_template',
  'description_template',
  'location_template',
] as const

function eventAssignmentsInclude(): Includeable[] {
  return [
    {
      model: EventInstance,
      as: 'eventInstance',
      attributes: [...EVENT_ASSIGNMENTS_ATTRIBUTES],
      include: [
        { model: EventShape, as: 'eventShape', attributes: ['id', 'name'] },
      ],
    },
  ]
}

function annotationAssignmentsInclude(): Includeable[] {
  return [
    {
      model: AnnotationInstance,
      as: 'annotation',
      attributes: ['id', 'text', 'userType', 'type'],
      include: [
        { model: AnnotationShape, as: 'annotationShape', attributes: ['id', 'name'] },
      ],
    },
    {
      model: BlockInstance,
      as: 'userTypeBlockInstance',
      attributes: ['id', 'name'],
      required: false,
    },
  ]
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface BuildWhereClauseParams {
  relationshipType: string
  relationshipConfig: RelationshipConfig
  query: Record<string, unknown>
  logWarn: (msg: string) => void
}

/**
 * Build Sequelize where clause for relationship list queries
 */
export function buildRelationshipWhereClause(params: BuildWhereClauseParams): Record<string, unknown> {
  const { relationshipType, relationshipConfig, query, logWarn } = params
  const parentId = query.parentId ?? query.parent_id
  const blockInstanceId = query.blockInstanceId as string | undefined

  const modelAttributes = relationshipConfig.model.getAttributes()
  const baseWhere: Record<string, unknown> = {}
  const whereWithDisabled =
    'disabled' in modelAttributes ? { ...baseWhere, disabled: false } : baseWhere

  let whereWithParentId = whereWithDisabled
  if (relationshipType === RELATIONSHIP_TYPES.INSTANCE_COMPONENTS && parentId) {
    if (typeof parentId === 'string' && UUID_REGEX.test(parentId)) {
      whereWithParentId = { ...whereWithDisabled, parentId }
    } else {
      logWarn(`Invalid parentId format: ${parentId}. Expected UUID, ignoring filter.`)
    }
  }

  if (relationshipType === RELATIONSHIP_TYPES.ANNOTATION_ASSIGNMENTS && blockInstanceId) {
    if (typeof blockInstanceId === 'string' && UUID_REGEX.test(blockInstanceId)) {
      return { ...whereWithParentId, blockInstanceId }
    }
    logWarn(`Invalid blockInstanceId format: ${blockInstanceId}. Expected UUID, ignoring filter.`)
  }
  return whereWithParentId
}

interface BuildQueryOptionsParams {
  relationshipType: string
  relationshipConfig: RelationshipConfig
  whereClause: Record<string, unknown>
}

/**
 * Build Sequelize query options (where, order, include, attributes) for relationship queries
 */
export function buildRelationshipQueryOptions(
  params: BuildQueryOptionsParams
): { where: Record<string, unknown>; order?: [string, string][]; include?: Includeable[]; attributes?: string[] } {
  const { relationshipType, relationshipConfig, whereClause } = params
  const options: {
    where: Record<string, unknown>
    order?: [string, string][]
    include?: Includeable[]
    attributes?: string[]
  } = { where: whereClause }

  if (relationshipType === RELATIONSHIP_TYPES.INSTANCE_COMPONENTS) {
    options.order = [[FIELD_NAMES.ORDER_INDEX, 'ASC']]
  }
  if (relationshipType === RELATIONSHIP_TYPES.EVENT_ASSIGNMENTS) {
    options.include = eventAssignmentsInclude()
  }
  if (relationshipType === RELATIONSHIP_TYPES.ANNOTATION_ASSIGNMENTS) {
    options.include = annotationAssignmentsInclude()
  }
  if (isModelUnderscored(relationshipConfig.model)) {
    options.attributes = getModelAttributes(relationshipConfig.model)
  }
  return options
}
