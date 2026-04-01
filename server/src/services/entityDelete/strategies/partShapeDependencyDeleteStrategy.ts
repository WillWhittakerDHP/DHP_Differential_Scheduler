import type {
  DeleteDependencyEdge,
  DeleteDependencyNode,
  DeletePreflightResponse,
  DeleteResolveResponse,
  DeleteResolutionAction,
} from '@shared/types/adminDeleteDependency.js'
import { PartShape } from '../../../config/app.js'
import { ERROR_MESSAGES } from '../../../routes/internal/entities/entityConstants.js'
import { countPartShapeDeleteDependencies } from '../../partShapes/countPartShapeDeleteDependencies.js'
import type {
  DependencyDeleteFinalizeArgs,
  DependencyDeletePreflightArgs,
  DependencyDeleteResolveArgs,
  DependencyDeleteFinalizeResult,
  DependencyDeleteStrategy,
} from '../dependencyDeleteStrategyTypes.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'

const NODE_TARGET = 'n-part-shape-target'
const NODE_BLOCKED = 'n-part-shape-blocked'

function buildPartShapeBlockedDetails(counts: Awaited<ReturnType<typeof countPartShapeDeleteDependencies>>): string {
  const validPricingCascadeCount =
    counts.validPricingCascadeParentCount + counts.validPricingCascadeChildCount
  return ERROR_MESSAGES.PART_SHAPE_IN_USE_DETAILS.replace(
    '{partInstanceCount}',
    String(counts.partInstanceCount)
  )
    .replace('{validPartCascadeCount}', String(counts.validPartCascadeCount))
    .replace('{validPricingCascadeCount}', String(validPricingCascadeCount))
}

function isOnlyNoopResolutions(resolutions: DeleteResolutionAction[]): boolean {
  return resolutions.every((r) => r.type === 'noop')
}

export const partShapeDependencyDeleteStrategy: DependencyDeleteStrategy = {
  async preflight(args: DependencyDeletePreflightArgs): Promise<DeletePreflightResponse> {
    const { entityId, entityType } = args
    const counts = await countPartShapeDeleteDependencies(entityId)
    const canDirectDelete = counts.totalCount === 0

    const nodes: DeleteDependencyNode[] = [
      {
        id: NODE_TARGET,
        kind: 'entity',
        label: 'Part shape',
        entityType,
        entityId,
      },
    ]
    const edges: DeleteDependencyEdge[] = []
    const blockedReasons: string[] = []

    if (!canDirectDelete) {
      const details = buildPartShapeBlockedDetails(counts)
      nodes.push({
        id: NODE_BLOCKED,
        kind: 'summary',
        label: 'Blocking dependencies',
        count: counts.totalCount,
      })
      edges.push({
        id: 'e-part-shape-hard-block',
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
              'This part shape still has blocking dependencies. Clear them using existing admin flows before finalize.',
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
            message: 'Only noop resolutions are supported for part shape delete in v1.',
          },
        ],
      }
    }

    return { applied: true }
  },

  async finalize(args: DependencyDeleteFinalizeArgs): Promise<DependencyDeleteFinalizeResult> {
    const { entityId, entityConfig, sequelize } = args

    return sequelize.transaction(async (transaction) => {
      const counts = await countPartShapeDeleteDependencies(entityId)
      if (counts.totalCount > 0) {
        return {
          ok: false,
          httpStatus: HTTP_STATUS_CODES.CONFLICT,
          error: ERROR_MESSAGES.PART_SHAPE_IN_USE,
          code: 'FINALIZE_CONFLICT',
          details: buildPartShapeBlockedDetails(counts),
        }
      }

      const deletedRows = await PartShape.destroy({
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
