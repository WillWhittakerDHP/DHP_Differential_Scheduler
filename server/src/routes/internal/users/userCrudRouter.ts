/**
 * WHY: User CRUD Router

LEARNING: Refactored to use CRUD router factory patter...
 */
import { User } from '../../../config/app.js'
import { createCrudRouter } from '../../helpers/createCrudRouter.js'
import { ERROR_MESSAGES } from './userConstants.js'

/**
 * WHY: User CRUD Router

LEARNING: Uses factory pattern to generate standardize...
 */
const router = createCrudRouter({
  model: User,
  resourceName: 'user',
  errorMessages: {
    FETCH_ALL: ERROR_MESSAGES.FETCH_USERS,
    FETCH_ONE: ERROR_MESSAGES.FETCH_USER,
    NOT_FOUND: ERROR_MESSAGES.USER_NOT_FOUND,
    CREATE: ERROR_MESSAGES.CREATE_USER,
    UPDATE: ERROR_MESSAGES.UPDATE_USER,
    PATCH: ERROR_MESSAGES.PATCH_USER,
    DELETE: ERROR_MESSAGES.DELETE_USER,
  },
})

export { router as UserCrudRouter }
