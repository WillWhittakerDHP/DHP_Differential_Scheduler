import { Router, Request, Response } from 'express';
import { User } from '../../../config/app.js';
import { 
  fetchAll, 
  fetchById, 
  createRecord, 
  updateRecord, 
  patchRecord, 
  deleteRecord 
} from '../../helpers/dataController.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await fetchAll(User);
    res.json(users);
  } catch (error) {
    console.error('[UserRouter] Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await fetchById(User, req.params.id);
    
    if (!user) {
      res.status(404).json({ 
        error: 'User not found',
        id: req.params.id
      });
      return;
    }
    
    res.json(user);
  } catch (error) {
    console.error('[UserRouter] Error fetching user:', error);
    res.status(500).json({ 
      error: 'Error fetching user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await createRecord(User, req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error('[UserRouter] Error creating user:', error);
    
    // LEARNING: Handle Sequelize validation errors as 400 Bad Request
    // PATTERN: Check error type, return appropriate status code with helpful message
    if (error instanceof Error && 
        (error.name === 'SequelizeValidationError' || 
         error.name === 'SequelizeUniqueConstraintError')) {
      const validationError = error as any;
      
      if (validationError.name === 'SequelizeUniqueConstraintError') {
        // PATTERN: Extract field name and value from SequelizeUniqueConstraintError
        const fieldName = validationError?.fields ? Object.keys(validationError.fields)[0] : 'field';
        const fieldValue = validationError?.fields ? Object.values(validationError.fields)[0] : '';
        
        res.status(400).json({
          error: 'Validation failed',
          details: `${fieldName} "${fieldValue}" already exists. Please use a unique value.`,
          field: fieldName,
          value: fieldValue
        });
        return;
      }
      
      // PATTERN: Map validation errors array to extract field names and messages
      if (validationError.errors && Array.isArray(validationError.errors) && validationError.errors.length > 0) {
        const fieldErrors = validationError.errors.map((err: any) => {
          const fieldName = err.path || 'field';
          const message = err.message || 'Validation error';
          return `${fieldName}: ${message}`;
        }).join('; ');
        
        res.status(400).json({
          error: 'Validation failed',
          details: fieldErrors
        });
        return;
      }
    }
    
    // Default to 500 for unexpected errors
    res.status(500).json({ 
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedRows = await updateRecord(User, req.params.id, req.body);
    
    if (updatedRows === 0) {
      res.status(404).json({ 
        error: 'User not found',
        id: req.params.id
      });
      return;
    }
    
    const user = await fetchById(User, req.params.id);
    res.json(user);
  } catch (error) {
    console.error('[UserRouter] Error updating user:', error);
    
    // LEARNING: Handle Sequelize validation errors as 400 Bad Request
    if (error instanceof Error && 
        (error.name === 'SequelizeValidationError' || 
         error.name === 'SequelizeUniqueConstraintError')) {
      const validationError = error as any;
      
      if (validationError.name === 'SequelizeUniqueConstraintError') {
        const fieldName = validationError?.fields ? Object.keys(validationError.fields)[0] : 'field';
        const fieldValue = validationError?.fields ? Object.values(validationError.fields)[0] : '';
        
        res.status(400).json({
          error: 'Validation failed',
          details: `${fieldName} "${fieldValue}" already exists. Please use a unique value.`,
          field: fieldName,
          value: fieldValue
        });
        return;
      }
      
      if (validationError.errors && Array.isArray(validationError.errors) && validationError.errors.length > 0) {
        const fieldErrors = validationError.errors.map((err: any) => {
          const fieldName = err.path || 'field';
          const message = err.message || 'Validation error';
          return `${fieldName}: ${message}`;
        }).join('; ');
        
        res.status(400).json({
          error: 'Validation failed',
          details: fieldErrors
        });
        return;
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await patchRecord(User, req.params.id, req.body);
    
    if (!updated) {
      res.status(404).json({ 
        error: 'User not found',
        id: req.params.id
      });
      return;
    }
    
    const user = await fetchById(User, req.params.id);
    res.json(user);
  } catch (error) {
    console.error('[UserRouter] Error patching user:', error);
    
    // LEARNING: Handle Sequelize validation errors as 400 Bad Request
    if (error instanceof Error && 
        (error.name === 'SequelizeValidationError' || 
         error.name === 'SequelizeUniqueConstraintError')) {
      const validationError = error as any;
      
      if (validationError.name === 'SequelizeUniqueConstraintError') {
        const fieldName = validationError?.fields ? Object.keys(validationError.fields)[0] : 'field';
        const fieldValue = validationError?.fields ? Object.values(validationError.fields)[0] : '';
        
        res.status(400).json({
          error: 'Validation failed',
          details: `${fieldName} "${fieldValue}" already exists. Please use a unique value.`,
          field: fieldName,
          value: fieldValue
        });
        return;
      }
      
      if (validationError.errors && Array.isArray(validationError.errors) && validationError.errors.length > 0) {
        const fieldErrors = validationError.errors.map((err: any) => {
          const fieldName = err.path || 'field';
          const message = err.message || 'Validation error';
          return `${fieldName}: ${message}`;
        }).join('; ');
        
        res.status(400).json({
          error: 'Validation failed',
          details: fieldErrors
        });
        return;
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to patch user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await deleteRecord(User, req.params.id);
    
    if (!deleted) {
      res.status(404).json({ 
        error: 'User not found',
        id: req.params.id
      });
      return;
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('[UserRouter] Error deleting user:', error);
    res.status(500).json({ 
      error: 'Failed to delete user',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as UserRouter };

