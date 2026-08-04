/**
 * Legacy alignment API — retired: role → instance mapping lives on `block_instances.semantic_type`.
 */
import { Router, Request, Response } from 'express'
import { checkOwnership, requireAuth } from '../../../middlewares/security.js'
import { sendSuccess } from '../../helpers/routerResponseHelpers.js'
const router = Router()

router.get('/', requireAuth, checkOwnership('userRoleBlockAlignment', 'id'), (_req: Request, res: Response): void => {
  sendSuccess(res, { alignments: {} })
})

router.put('/', requireAuth, checkOwnership('userRoleBlockAlignment', 'id'), (_req: Request, res: Response): void => {
  res.status(410).json({
    error:
      'user_role_block_alignments is retired. Set canonical roles on each user-type block instance via semanticType (block_instances.semantic_type).',
  })
})

export { router as UserRoleBlockAlignmentRouter }
