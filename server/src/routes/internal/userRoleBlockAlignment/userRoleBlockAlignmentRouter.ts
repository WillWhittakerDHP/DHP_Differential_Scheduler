/**
 * GET/PUT singleton: canonical user_role → block_instance_id overrides (Session 6.18.2.1).
 */
import { Router, Request, Response } from 'express'
import { handleRouteError } from '../../helpers/routerErrorHandler.js'
import { sendBadRequest, sendSuccess } from '../../helpers/routerResponseHelpers.js'
import { checkOwnership, csrfProtection, requireAuth } from '../../../middlewares/security.js'
import { validateRequest } from '../../../middlewares/validateRequest.js'
import { userRoleBlockAlignmentPutBodySchema } from '../../schemas/userRoleBlockAlignmentSchemas.js'
import {
  getAlignmentOverrides,
  saveAlignmentOverrides,
} from '../../../repositories/userRoleBlockAlignmentRepository.js'
import { validateUserRoleBlockAlignmentPayload } from '../../../utils/validateUserRoleBlockAlignmentPayload.js'
import { invalidateUserTypeMappingCaches } from '../../../utils/userTypeMapping.js'

const ERROR_FETCH = 'Failed to fetch user role block alignment'
const ERROR_UPDATE = 'Failed to update user role block alignment'

const router = Router()

router.get('/', requireAuth, checkOwnership('userRoleBlockAlignment', 'id'), async (_req: Request, res: Response): Promise<void> => {
  try {
    const alignments = await getAlignmentOverrides()
    sendSuccess(res, { alignments })
  } catch (error) {
    handleRouteError(error, res, ERROR_FETCH, 'fetching user role block alignment')
  }
})

router.put(
  '/',
  csrfProtection,
  requireAuth,
  checkOwnership('userRoleBlockAlignment', 'id'),
  validateRequest(userRoleBlockAlignmentPutBodySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const validated = await validateUserRoleBlockAlignmentPayload(req.body)
      if (!validated.ok) {
        sendBadRequest(res, validated.error)
        return
      }
      const saved = await saveAlignmentOverrides(validated.normalized)
      invalidateUserTypeMappingCaches()
      sendSuccess(res, { alignments: saved })
    } catch (error) {
      handleRouteError(error, res, ERROR_UPDATE, 'updating user role block alignment')
    }
  }
)

export { router as UserRoleBlockAlignmentRouter }
