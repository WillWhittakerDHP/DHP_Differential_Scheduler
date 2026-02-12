/**
 * Business Rules CRUD Router
 * 
 * LEARNING: Refactored to use CRUD router factory pattern with custom query filtering
 * WHY: Eliminates boilerplate, ensures consistent patterns, wires in security middleware
 * PATTERN: Factory-generated router with custom GET / override for query filtering and extra route
 */

import { Request, Response } from 'express'
import { BusinessRule } from '../../config/app.js'
import { createCrudRouter } from '../helpers/createCrudRouter.js'
import { FIELD_NAMES, SORT_ORDERS } from './entities/entityConstants.js'
import { ERROR_MESSAGES } from './businessRulesConstants.js'
import { handleRouteError } from './businessRulesErrorHandler.js'
import { validateRequiredFields, validateRuleType } from './businessRulesValidators.js'
import { sendSuccess } from '../helpers/routerResponseHelpers.js'
import { ValidationResult } from '../helpers/routerValidators.js'

// Create base CRUD router using factory with custom GET / handler for query filtering
const router = createCrudRouter({
  model: BusinessRule,
  resourceName: 'business rule',
  errorMessages: {
    FETCH_ALL: ERROR_MESSAGES.FETCH_BUSINESS_RULES,
    FETCH_ONE: ERROR_MESSAGES.FETCH_BUSINESS_RULE,
    NOT_FOUND: ERROR_MESSAGES.BUSINESS_RULE_NOT_FOUND,
    CREATE: ERROR_MESSAGES.CREATE_BUSINESS_RULE,
    UPDATE: ERROR_MESSAGES.UPDATE_BUSINESS_RULE,
    DELETE: ERROR_MESSAGES.DELETE_BUSINESS_RULE,
  },
  defaultOrder: [[FIELD_NAMES.CREATED_AT, SORT_ORDERS.DESC]],
  customGetAllHandler: async (req: Request, res: Response): Promise<void> => {
    try {
      const { blockInstanceId, ruleType, active } = req.query
      
      const where: Record<string, unknown> = {}
      if (blockInstanceId) where.blockInstanceId = blockInstanceId
      if (ruleType) where.ruleType = ruleType
      if (active !== undefined) where.active = active === 'true'
      
      const businessRules = await BusinessRule.findAll({
        where,
        order: [[FIELD_NAMES.CREATED_AT, SORT_ORDERS.DESC]],
      })
      
      sendSuccess(res, businessRules)
    } catch (error) {
      handleRouteError(error, res, ERROR_MESSAGES.FETCH_BUSINESS_RULES, 'fetching business rules')
    }
  },
  validateRequest: (req: Request, method: 'create' | 'update' | 'patch'): ValidationResult => {
    if (method === 'create' || method === 'update') {
      const { blockInstanceId, ruleType, ruleConfig } = req.body
      
      // Validate required fields
      const requiredFieldsValidation = validateRequiredFields({ blockInstanceId, ruleType, ruleConfig })
      if (!requiredFieldsValidation.valid) {
        return requiredFieldsValidation
      }
      
      // Validate rule type
      const ruleTypeValidation = validateRuleType(ruleType)
      if (!ruleTypeValidation.valid) {
        return ruleTypeValidation
      }
    }
    
    return { valid: true }
  },
  sanitizeInput: (data: unknown, method: 'create' | 'update' | 'patch'): unknown => {
    const body = data as { validationMessageAnnotationId?: string; active?: boolean }
    
    if (method === 'create' || method === 'update') {
      return {
        ...body,
        validationMessageAnnotationId: body.validationMessageAnnotationId || null,
        active: body.active !== undefined ? body.active : true,
      }
    }
    
    return data
  },
})

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
      order: [[FIELD_NAMES.CREATED_AT, SORT_ORDERS.DESC]],
    })
    
    res.json(businessRules)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_BUSINESS_RULES, 'fetching business rules')
  }
})

/**
 * GET /business-rules/block/:blockInstanceId
 * Get all active business rules for a specific block instance
 * 
 * LEARNING: Extra route for block-specific business rules
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
    
    sendSuccess(res, businessRules)
  } catch (error) {
    handleRouteError(error, res, ERROR_MESSAGES.FETCH_BUSINESS_RULES_FOR_BLOCK, 'fetching business rules for block')
  }
})

export { router as BusinessRulesCrudRouter }
