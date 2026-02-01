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

