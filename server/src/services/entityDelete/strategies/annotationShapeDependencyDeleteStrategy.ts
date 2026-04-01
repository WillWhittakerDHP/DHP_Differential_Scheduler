import type {
  DeleteDependencyEdge,
  DeleteDependencyNode,
  DeletePreflightResponse,
  DeleteResolveResponse,
  DeleteResolutionAction,
} from '@shared/types/adminDeleteDependency.js'
import { AnnotationShape } from '../../../config/app.js'
import { ERROR_MESSAGES } from '../../../routes/internal/entities/entityConstants.js'
import { countAnnotationShapeDeleteDependencies } from '../../annotations/countAnnotationShapeDeleteDependencies.js'
import type {
  DependencyDeleteFinalizeArgs,
  DependencyDeletePreflightArgs,
  DependencyDeleteResolveArgs,
  DependencyDeleteFinalizeResult,
  DependencyDeleteStrategy,
} from '../dependencyDeleteStrategyTypes.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'

const NODE_TARGET = 'n-annotation-shape-target'
const NODE_BLOCKED = 'n-annotation-shape-blocked'

function buildAnnotationShapeBlockedDetails(
  counts: Awaited<ReturnType<typeof countAnnotationShapeDeleteDependencies>>
): string {
  return ERROR_MESSAGES.ANNOTATION_SHAPE_IN_USE_DETAILS.replace(
    '{annotationInstanceCount}',
    String(counts.annotationInstanceCount)
  ).replace('{validAnnotationAssignmentChildCount}', String(counts.validAnnotationAssignmentChildCount))
}

function isOnlyNoopResolutions(resolutions: DeleteResolutionAction[]): boolean {
  return resolutions.every((r) => r.type === 'noop')
}

export const annotationShapeDependencyDeleteStrategy: DependencyDeleteStrategy = {
  async preflight(args: DependencyDeletePreflightArgs): Promise<DeletePreflightResponse> {
    const { entityId, entityType } = args
    const counts = await countAnnotationShapeDeleteDependencies(entityId)
    const canDirectDelete = counts.totalCount === 0

    const nodes: DeleteDependencyNode[] = [
      {
        id: NODE_TARGET,
        kind: 'entity',
        label: 'Annotation shape',
        entityType,
        entityId,
      },
    ]
    const edges: DeleteDependencyEdge[] = []
    const blockedReasons: string[] = []

    if (!canDirectDelete) {
      const details = buildAnnotationShapeBlockedDetails(counts)
      nodes.push({
        id: NODE_BLOCKED,
        kind: 'summary',
        label: 'Blocking dependencies',
        count: counts.totalCount,
      })
      edges.push({
        id: 'e-annotation-shape-hard-block',
        fromNodeId: NODE_TARGET,
        toNodeId: NODE_BLOCKED,
        policy: 'hard_blocked',
        message: details,
      })
      blockedReasons.push(details)
    }

    return {
      entityType,
      entityId,
      nodes,
      edges,
      canDirectDelete,
      blockedReasons: blockedReasons.length > 0 ? blockedReasons : undefined,
    }
  },

  async resolve(args: DependencyDeleteResolveArgs): Promise<DeleteResolveResponse> {
    const { body, tokenSnapshot } = args

    if (!tokenSnapshot.canDirectDelete) {
      return {
        applied: false,
        partialErrors: [
          {
            code: 'HARD_BLOCKED',
            message:
              'This annotation shape still has blocking dependencies. Clear them using existing admin flows before finalize.',
          },
        ],
      }
    }

    if (!isOnlyNoopResolutions(body.resolutions)) {
      return {
        applied: false,
        partialErrors: [
          {
            code: 'RESOLUTION_INVALID',
            message: 'Only noop resolutions are supported for annotation shape delete in v1.',
          },
        ],
      }
    }

    return { applied: true }
  },

  async finalize(args: DependencyDeleteFinalizeArgs): Promise<DependencyDeleteFinalizeResult> {
    const { entityId, entityConfig, sequelize } = args

    return sequelize.transaction(async (transaction) => {
      const counts = await countAnnotationShapeDeleteDependencies(entityId)
      if (counts.totalCount > 0) {
        return {
          ok: false,
          httpStatus: HTTP_STATUS_CODES.CONFLICT,
          error: ERROR_MESSAGES.ANNOTATION_SHAPE_IN_USE,
          code: 'FINALIZE_CONFLICT',
          details: buildAnnotationShapeBlockedDetails(counts),
        }
      }

      const deletedRows = await AnnotationShape.destroy({
        where: { id: entityId },
        transaction,
      })

      if (deletedRows === 0) {
        const msg = ERROR_MESSAGES.ENTITY_NOT_FOUND.replace('{displayName}', entityConfig.displayName)
        return {
          ok: false,
          httpStatus: HTTP_STATUS_CODES.NOT_FOUND,
          error: msg,
          code: 'ENTITY_NOT_FOUND',
          details: msg,
        }
      }

      return { ok: true, body: { deleted: true, entityId } }
    })
  },
}
