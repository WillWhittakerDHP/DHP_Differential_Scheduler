import type {
  DeleteDependencyEdge,
  DeleteDependencyNode,
  DeletePreflightResponse,
  DeleteResolveResponse,
  DeleteResolutionAction,
} from '@shared/types/adminDeleteDependency.js'
import { BlockShape } from '../../../config/app.js'
import { ERROR_MESSAGES } from '../../../routes/internal/entities/entityConstants.js'
import { countBlockShapeDeleteDependencies } from '../../blockShapes/countBlockShapeDeleteDependencies.js'
import type {
  DependencyDeleteFinalizeArgs,
  DependencyDeletePreflightArgs,
  DependencyDeleteResolveArgs,
  DependencyDeleteFinalizeResult,
  DependencyDeleteStrategy,
} from '../dependencyDeleteStrategyTypes.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'

const NODE_TARGET = 'n-block-shape-target'
const NODE_BLOCKED = 'n-block-shape-blocked'

function buildBlockShapeBlockedDetails(counts: Awaited<ReturnType<typeof countBlockShapeDeleteDependencies>>): string {
  return ERROR_MESSAGES.BLOCK_SHAPE_IN_USE_DETAILS.replace(
    '{blockInstanceCount}',
    String(counts.blockInstanceCount)
  )
    .replace('{validBookingCascadeCount}', String(counts.validBookingCascadeCount))
    .replace('{validPartCascadeParentCount}', String(counts.validPartCascadeParentCount))
    .replace('{validAnnotationAssignmentParentCount}', String(counts.validAnnotationAssignmentParentCount))
    .replace('{validEventCascadeParentCount}', String(counts.validEventCascadeParentCount))
}

function isOnlyNoopResolutions(resolutions: DeleteResolutionAction[]): boolean {
  return resolutions.every((r) => r.type === 'noop')
}

export const blockShapeDependencyDeleteStrategy: DependencyDeleteStrategy = {
  async preflight(args: DependencyDeletePreflightArgs): Promise<DeletePreflightResponse> {
    const { entityId, entityType } = args
    const counts = await countBlockShapeDeleteDependencies(entityId)
    const canDirectDelete = counts.totalCount === 0

    const nodes: DeleteDependencyNode[] = [
      {
        id: NODE_TARGET,
        kind: 'entity',
        label: 'Block shape',
        entityType,
        entityId,
      },
    ]
    const edges: DeleteDependencyEdge[] = []
    const blockedReasons: string[] = []

    if (!canDirectDelete) {
      const details = buildBlockShapeBlockedDetails(counts)
      nodes.push({
        id: NODE_BLOCKED,
        kind: 'summary',
        label: 'Blocking dependencies',
        count: counts.totalCount,
      })
      edges.push({
        id: 'e-block-shape-hard-block',
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
              'This block shape still has blocking dependencies. Clear them using existing admin flows before finalize.',
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
            message: 'Only noop resolutions are supported for block shape delete in v1.',
          },
        ],
      }
    }

    return { applied: true }
  },

  async finalize(args: DependencyDeleteFinalizeArgs): Promise<DependencyDeleteFinalizeResult> {
    const { entityId, entityConfig, sequelize } = args

    return sequelize.transaction(async (transaction) => {
      const counts = await countBlockShapeDeleteDependencies(entityId)
      if (counts.totalCount > 0) {
        return {
          ok: false,
          httpStatus: HTTP_STATUS_CODES.CONFLICT,
          error: ERROR_MESSAGES.BLOCK_SHAPE_IN_USE,
          code: 'FINALIZE_CONFLICT',
          details: buildBlockShapeBlockedDetails(counts),
        }
      }

      const deletedRows = await BlockShape.destroy({
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
