import { Router } from 'express'
import type { Request, Response } from 'express'
import { User } from '../../../config/app.js'
import { csrfProtection, checkOwnership } from '../../../middlewares/security.js'
import { validateRequest } from '../../../middlewares/validateRequest.js'
import {
  userCreateBodySchema,
  userUpdateBodySchema,
  userPatchBodySchema,
} from '../../schemas/userSchemas.js'
import { ERROR_MESSAGES } from './userConstants.js'
import { fetchAll, fetchById, createRecord, deleteRecord } from '../../helpers/dataController.js'
import { handleRouteError } from '../../helpers/routerErrorHandler.js'
import {
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
} from '../../helpers/routerResponseHelpers.js'
import { paramString } from '../../helpers/requestHelpers.js'
import { performUpdateAndFetch } from '../../helpers/crudHandlerHelpers.js'
import type { CrudErrorMessages } from '../../helpers/crudRouterTypes.js'

const CRUD_ERROR_MESSAGES: CrudErrorMessages = {
  FETCH_ALL: ERROR_MESSAGES.FETCH_USERS,
  FETCH_ONE: ERROR_MESSAGES.FETCH_USER,
  NOT_FOUND: ERROR_MESSAGES.USER_NOT_FOUND,
  CREATE: ERROR_MESSAGES.CREATE_USER,
  UPDATE: ERROR_MESSAGES.UPDATE_USER,
  PATCH: ERROR_MESSAGES.PATCH_USER,
  DELETE: ERROR_MESSAGES.DELETE_USER,
}

const router = Router()

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const records = await fetchAll(User)
    sendSuccess(res, records)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_USERS, 'fetching users', 'user')
  }
})

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = paramString(req, 'id')
    const record = await fetchById(User, id)
    if (!record) {
      sendNotFound(res, ERROR_MESSAGES.USER_NOT_FOUND, id)
      return
    }
    sendSuccess(res, record)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_USER, 'fetching user', 'user', paramString(req, 'id'))
  }
})

router.post(
  '/',
  csrfProtection,
  validateRequest(userCreateBodySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Joi schema validates body shape; cast is safe after validateRequest passes
      const record = await createRecord(User, req.body)
      sendCreated(res, record)
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.CREATE_USER, 'creating user', 'user')
    }
  }
)

router.put(
  '/:id',
  csrfProtection,
  checkOwnership('user', 'id'),
  validateRequest(userUpdateBodySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = paramString(req, 'id')
      const record = await performUpdateAndFetch(
        User,
        id,
        req.body as Record<string, unknown>,
        'update',
        CRUD_ERROR_MESSAGES,
        res
      )
      if (!record) return
      sendSuccess(res, record)
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.UPDATE_USER, 'updating user', 'user', paramString(req, 'id'))
    }
  }
)

router.patch(
  '/:id',
  csrfProtection,
  checkOwnership('user', 'id'),
  validateRequest(userPatchBodySchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = paramString(req, 'id')
      const record = await performUpdateAndFetch(
        User,
        id,
        req.body as Record<string, unknown>,
        'patch',
        CRUD_ERROR_MESSAGES,
        res
      )
      if (!record) return
      sendSuccess(res, record)
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.PATCH_USER, 'patching user', 'user', paramString(req, 'id'))
    }
  }
)

router.delete(
  '/:id',
  csrfProtection,
  checkOwnership('user', 'id'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const id = paramString(req, 'id')
      const record = await fetchById(User, id)
      if (!record) {
        sendNotFound(res, ERROR_MESSAGES.USER_NOT_FOUND, id)
        return
      }
      const deletedCount = await deleteRecord(User, id)
      if (deletedCount === 0) {
        sendNotFound(res, ERROR_MESSAGES.USER_NOT_FOUND, id)
        return
      }
      sendNoContent(res)
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.DELETE_USER, 'deleting user', 'user', paramString(req, 'id'))
    }
  }
)

export { router as UserCrudRouter }
