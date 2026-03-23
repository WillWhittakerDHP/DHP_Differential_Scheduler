import type { Request, Response, Router } from 'express';
import { handleEntityCrudGetById, handleEntityCrudList } from './entityCrudReadHandlers.js';

export function registerEntityCrudReadRoutes(router: Router): void {
  router.get('/:entityType', async (req: Request, res: Response): Promise<void> => {
    await handleEntityCrudList(req, res);
  });
  router.get('/:entityType/:id', async (req: Request, res: Response): Promise<void> => {
    await handleEntityCrudGetById(req, res);
  });
}
