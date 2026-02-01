import { Router, Request, Response } from 'express';
import { BusinessRule } from '../../config/app.js';
import type { RuleType, RuleConfig } from '../../db/models/admin/business_rule.js';

const router = Router();

/**
 * Business Rules Router
 * 
 * LEARNING: Handles CRUD operations for admin-configurable business validation rules
 * WHY: Replaces hardcoded validation logic with database-driven rules per block instance
 * PATTERN: REST API with full CRUD + block-specific query endpoint
 */

/**
 * GET /api/v1/internal/business-rules
 * Get all business rules or filter by query params
 * 
 * Query params:
 * - blockInstanceId: Filter by block instance
 * - ruleType: Filter by rule type
 * - active: Filter by active status
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { blockInstanceId, ruleType, active } = req.query;
    
    // Build where clause based on query params
    const where: Record<string, unknown> = {};
    if (blockInstanceId) where.blockInstanceId = blockInstanceId;
    if (ruleType) where.ruleType = ruleType;
    if (active !== undefined) where.active = active === 'true';
    
    const businessRules = await BusinessRule.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
    
    res.json(businessRules);
  } catch (error) {
    console.error('Error fetching business rules:', error);
    res.status(500).json({ 
      error: 'Failed to fetch business rules',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/internal/business-rules/:id
 * Get single business rule by ID
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const businessRule = await BusinessRule.findByPk(id);
    
    if (!businessRule) {
      res.status(404).json({ 
        error: 'Business rule not found',
        id 
      });
      return;
    }
    
    res.json(businessRule);
  } catch (error) {
    console.error('Error fetching business rule:', error);
    res.status(500).json({ 
      error: 'Failed to fetch business rule',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/v1/internal/business-rules/block/:blockInstanceId
 * Get all business rules for a specific block instance
 * 
 * LEARNING: Special endpoint for wizard validation (fetch all rules for selected blocks)
 * WHY: Wizard needs to load rules for all selected services/dwelling adjustments
 * PATTERN: Block-specific query with annotation include
 */
router.get('/block/:blockInstanceId', async (req: Request, res: Response) => {
  try {
    const { blockInstanceId } = req.params;
    
    const businessRules = await BusinessRule.findAll({
      where: {
        blockInstanceId,
        active: true, // Only return active rules
      },
      order: [['ruleType', 'ASC']],
    });
    
    // TODO: Include validation message annotations via sequelize association (future enhancement)
    // For now, client will need to fetch annotation instances separately
    
    res.json(businessRules);
  } catch (error) {
    console.error('Error fetching business rules for block:', error);
    res.status(500).json({ 
      error: 'Failed to fetch business rules for block',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/v1/internal/business-rules
 * Create new business rule
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { blockInstanceId, ruleType, ruleConfig, validationMessageAnnotationId, active } = req.body;
    
    // Validate required fields
    if (!blockInstanceId || !ruleType || !ruleConfig) {
      res.status(400).json({ 
        error: 'Missing required fields',
        required: ['blockInstanceId', 'ruleType', 'ruleConfig']
      });
      return;
    }
    
    // Validate ruleType
    const validRuleTypes: RuleType[] = ['required_fields', 'requires_agent', 'conditional_validation', 'validation_message'];
    if (!validRuleTypes.includes(ruleType)) {
      res.status(400).json({ 
        error: 'Invalid ruleType',
        ruleType,
        validRuleTypes
      });
      return;
    }
    
    // Create business rule
    const businessRule = await BusinessRule.create({
      blockInstanceId,
      ruleType,
      ruleConfig,
      validationMessageAnnotationId: validationMessageAnnotationId || null,
      active: active !== undefined ? active : true,
    });
    
    res.status(201).json(businessRule);
  } catch (error) {
    console.error('Error creating business rule:', error);
    res.status(500).json({ 
      error: 'Failed to create business rule',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * PUT /api/v1/internal/business-rules/:id
 * Update business rule (full replace)
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { blockInstanceId, ruleType, ruleConfig, validationMessageAnnotationId, active } = req.body;
    
    const businessRule = await BusinessRule.findByPk(id);
    
    if (!businessRule) {
      res.status(404).json({ 
        error: 'Business rule not found',
        id 
      });
      return;
    }
    
    // Validate required fields
    if (!blockInstanceId || !ruleType || !ruleConfig) {
      res.status(400).json({ 
        error: 'Missing required fields',
        required: ['blockInstanceId', 'ruleType', 'ruleConfig']
      });
      return;
    }
    
    // Update business rule
    await businessRule.update({
      blockInstanceId,
      ruleType,
      ruleConfig,
      validationMessageAnnotationId: validationMessageAnnotationId || null,
      active: active !== undefined ? active : true,
    });
    
    res.json(businessRule);
  } catch (error) {
    console.error('Error updating business rule:', error);
    res.status(500).json({ 
      error: 'Failed to update business rule',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * PATCH /api/v1/internal/business-rules/:id
 * Partial update business rule
 */
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const businessRule = await BusinessRule.findByPk(id);
    
    if (!businessRule) {
      res.status(404).json({ 
        error: 'Business rule not found',
        id 
      });
      return;
    }
    
    // Update only provided fields
    await businessRule.update(updates);
    
    res.json(businessRule);
  } catch (error) {
    console.error('Error updating business rule:', error);
    res.status(500).json({ 
      error: 'Failed to update business rule',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * DELETE /api/v1/internal/business-rules/:id
 * Delete business rule
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const businessRule = await BusinessRule.findByPk(id);
    
    if (!businessRule) {
      res.status(404).json({ 
        error: 'Business rule not found',
        id 
      });
      return;
    }
    
    await businessRule.destroy();
    
    res.json({ 
      message: 'Business rule deleted successfully',
      id 
    });
  } catch (error) {
    console.error('Error deleting business rule:', error);
    res.status(500).json({ 
      error: 'Failed to delete business rule',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
