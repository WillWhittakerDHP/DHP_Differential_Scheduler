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

router.get('/', async (req: Request, res: Response) => {
  try {
    const { blockInstanceId, ruleType, active } = req.query;
    
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
    
    
    res.json(businessRules);
  } catch (error) {
    console.error('Error fetching business rules for block:', error);
    res.status(500).json({ 
      error: 'Failed to fetch business rules for block',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

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
    
    const validRuleTypes: RuleType[] = ['required_fields', 'requires_agent', 'conditional_validation', 'validation_message'];
    if (!validRuleTypes.includes(ruleType)) {
      res.status(400).json({ 
        error: 'Invalid ruleType',
        ruleType,
        validRuleTypes
      });
      return;
    }
    
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
