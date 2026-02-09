/**
 * Business Rules CRUD Router
 * 
 * LEARNING: Extracted CRUD operations for business rules
 * WHY: Separates CRUD operations from router setup, improves maintainability
 * PATTERN: Express router with RESTful endpoints
 */

import { Router, Request, Response } from 'express'
import { BusinessRule } from '../../config/app.js'
import { Op } from 'sequelize'
import { ERROR_MESSAGES } from './businessRulesConstants.js'
import { handleRouteError } from './businessRulesErrorHandler.js'
import { validateRequiredFields, validateRuleType } from './businessRulesValidators.js'
import { HTTP_STATUS_CODES } from '../../constants/router.js'

const router = Router()

/**
 * GET /business-rules
 * List all business rules with optional filtering
 * 
 * LEARNING: Fetches all business rules with query parameter filtering
 * WHY: Provides flexible querying of business rules
 * PATTERN: Build where clause from query params, fetch with ordering
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockInstanceId, ruleType, active } = req.query
    
    const where: Record<string, unknown> = {}
    if (blockInstanceId) where.blockInstanceId = blockInstanceId
    if (ruleType) where.ruleType = ruleType
    if (active !== undefined) where.active = active === 'true'
    
    const businessRules = await BusinessRule.findAll({
      where,
      order: [['createdAt', 'DESC']],
    })
    
    res.json(businessRules)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_BUSINESS_RULES, 'fetching business rules')
  }
})

/**
 * GET /business-rules/:id
 * Get single business rule by ID
 * 
 * LEARNING: Fetches single business rule by ID
 * WHY: Provides complete business rule data for a specific rule
 * PATTERN: Fetch by ID, return 404 if not found
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    
    const businessRule = await BusinessRule.findByPk(id)
    
    if (!businessRule) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
        error: ERROR_MESSAGES.BUSINESS_RULE_NOT_FOUND,
        id 
      })
      return
    }
    
    res.json(businessRule)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_BUSINESS_RULE, 'fetching business rule')
  }
})

/**
 * GET /business-rules/block/:blockInstanceId
 * Get all active business rules for a specific block instance
 * 
 * LEARNING: Fetches active business rules for a block instance
 * WHY: Provides block-specific business rules for validation
 * PATTERN: Fetch with block instance filter and active filter, order by rule type
 */
router.get('/block/:blockInstanceId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockInstanceId } = req.params
    
    const businessRules = await BusinessRule.findAll({
      where: {
        blockInstanceId,
        active: true, // Only return active rules
      },
      order: [['ruleType', 'ASC']],
    })
    
    res.json(businessRules)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_BUSINESS_RULES_FOR_BLOCK, 'fetching business rules for block')
  }
})

/**
 * POST /business-rules
 * Create a new business rule
 * 
 * LEARNING: Creates a new business rule record
 * WHY: Enables business rule creation via API
 * PATTERN: Validate required fields and rule type, create record, return 201
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockInstanceId, ruleType, ruleConfig, validationMessageAnnotationId, active } = req.body
    
    // Validate required fields
    const requiredFieldsValidation = validateRequiredFields({ blockInstanceId, ruleType, ruleConfig })
    if (!requiredFieldsValidation.valid) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ 
        error: requiredFieldsValidation.error,
        ...requiredFieldsValidation.details
      })
      return
    }
    
    // Validate rule type
    const ruleTypeValidation = validateRuleType(ruleType)
    if (!ruleTypeValidation.valid) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ 
        error: ruleTypeValidation.error,
        ...ruleTypeValidation.details
      })
      return
    }
    
    const businessRule = await BusinessRule.create({
      blockInstanceId,
      ruleType,
      ruleConfig,
      validationMessageAnnotationId: validationMessageAnnotationId || null,
      active: active !== undefined ? active : true,
    })
    
    res.status(HTTP_STATUS_CODES.CREATED).json(businessRule)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.CREATE_BUSINESS_RULE, 'creating business rule')
  }
})

/**
 * PUT /business-rules/:id
 * Update a business rule (full update)
 * 
 * LEARNING: Updates a business rule record with full replacement
 * WHY: Enables full business rule updates via API
 * PATTERN: Validate required fields and rule type, update record, return updated record
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const { blockInstanceId, ruleType, ruleConfig, validationMessageAnnotationId, active } = req.body
    
    const businessRule = await BusinessRule.findByPk(id)
    
    if (!businessRule) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
        error: ERROR_MESSAGES.BUSINESS_RULE_NOT_FOUND,
        id 
      })
      return
    }
    
    // Validate required fields
    const requiredFieldsValidation = validateRequiredFields({ blockInstanceId, ruleType, ruleConfig })
    if (!requiredFieldsValidation.valid) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({ 
        error: requiredFieldsValidation.error,
        ...requiredFieldsValidation.details
      })
      return
    }
    
    await businessRule.update({
      blockInstanceId,
      ruleType,
      ruleConfig,
      validationMessageAnnotationId: validationMessageAnnotationId || null,
      active: active !== undefined ? active : true,
    })
    
    res.json(businessRule)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.UPDATE_BUSINESS_RULE, 'updating business rule')
  }
})

/**
 * PATCH /business-rules/:id
 * Partially update a business rule
 * 
 * LEARNING: Updates a business rule record with partial data
 * WHY: Enables partial business rule updates via API
 * PATTERN: Patch record, return 404 if not found, return updated record
 */
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const updates = req.body
    
    const businessRule = await BusinessRule.findByPk(id)
    
    if (!businessRule) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
        error: ERROR_MESSAGES.BUSINESS_RULE_NOT_FOUND,
        id 
      })
      return
    }
    
    await businessRule.update(updates)
    
    res.json(businessRule)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.UPDATE_BUSINESS_RULE, 'updating business rule')
  }
})

/**
 * DELETE /business-rules/:id
 * Delete a business rule
 * 
 * LEARNING: Deletes a business rule record
 * WHY: Enables business rule deletion via API
 * PATTERN: Delete record, return 404 if not found, return success message
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    
    const businessRule = await BusinessRule.findByPk(id)
    
    if (!businessRule) {
      res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ 
        error: ERROR_MESSAGES.BUSINESS_RULE_NOT_FOUND,
        id 
      })
      return
    }
    
    await businessRule.destroy()
    
    res.json({ 
      message: 'Business rule deleted successfully',
      id 
    })
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.DELETE_BUSINESS_RULE, 'deleting business rule')
  }
})

export { router as BusinessRulesCrudRouter }
