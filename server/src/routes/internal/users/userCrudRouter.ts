/**
 * User CRUD Router
 * 
 * LEARNING: Extracted CRUD operations for users
 * WHY: Separates CRUD operations from router setup, improves maintainability
 * PATTERN: Express router with RESTful endpoints
 */

import { Router, Request, Response } from 'express'
import { User } from '../../../config/app.js'
import { 
  fetchAll, 
  fetchById, 
  createRecord, 
  updateRecord, 
  patchRecord, 
  deleteRecord
} from '../../helpers/dataController.js'
import { ERROR_MESSAGES } from './userConstants.js'
import { handleRouteError } from './userErrorHandler.js'
import { HTTP_STATUS_CODES } from '../../../constants/router.js'

const router = Router()

/**
 * GET /users
 * List all users
 * 
 * LEARNING: Fetches all users
 * WHY: Provides complete user data
 * PATTERN: Fetch all, return JSON
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await fetchAll(User)
    res.json(users)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_USERS, 'fetching users')
  }
})

/**
 * GET /users/:id
 * Get single user by ID
 * 
 * LEARNING: Fetches single user by ID
 * WHY: Provides complete user data for a specific user
 * PATTERN: Fetch by ID, return 404 if not found
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await fetchById(User, req.params.id)
    
    if (!user) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
        error: ERROR_MESSAGES.USER_NOT_FOUND,
        id: req.params.id
      })
      return
    }
    
    res.json(user)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_USER, 'fetching user')
  }
})

/**
 * POST /users
 * Create a new user
 * 
 * LEARNING: Creates a new user record
 * WHY: Enables user creation via API
 * PATTERN: Create record, return 201 with created record
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await createRecord(User, req.body)
    res.status(HTTP_STATUS_CODES.CREATED).json(user)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.CREATE_USER, 'creating user')
  }
})

/**
 * PUT /users/:id
 * Update a user (full update)
 * 
 * LEARNING: Updates a user record with full replacement
 * WHY: Enables full user updates via API
 * PATTERN: Update record, return 404 if not found, return updated record
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedRows = await updateRecord(User, req.params.id, req.body)
    
    if (updatedRows === 0) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
        error: ERROR_MESSAGES.USER_NOT_FOUND,
        id: req.params.id
      })
      return
    }
    
    const user = await fetchById(User, req.params.id)
    res.json(user)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.UPDATE_USER, 'updating user')
  }
})

/**
 * PATCH /users/:id
 * Partially update a user
 * 
 * LEARNING: Updates a user record with partial data
 * WHY: Enables partial user updates via API
 * PATTERN: Patch record, return 404 if not found, return updated record
 */
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await patchRecord(User, req.params.id, req.body)
    
    if (!updated) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
        error: ERROR_MESSAGES.USER_NOT_FOUND,
        id: req.params.id
      })
      return
    }
    
    const user = await fetchById(User, req.params.id)
    res.json(user)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.PATCH_USER, 'patching user')
  }
})

/**
 * DELETE /users/:id
 * Delete a user
 * 
 * LEARNING: Deletes a user record
 * WHY: Enables user deletion via API
 * PATTERN: Delete record, return 404 if not found, return 204 on success
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await deleteRecord(User, req.params.id)
    
    if (!deleted) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
        error: ERROR_MESSAGES.USER_NOT_FOUND,
        id: req.params.id
      })
      return
    }
    
    res.status(HTTP_STATUS_CODES.NO_CONTENT).send()
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.DELETE_USER, 'deleting user')
  }
})

export { router as UserCrudRouter }
