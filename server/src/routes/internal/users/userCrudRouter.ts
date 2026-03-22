import { User } from '../../../config/app.js'
import { createCrudRouter } from '../../helpers/createCrudRouter.js'
import { ERROR_MESSAGES } from './userConstants.js'

/**

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
