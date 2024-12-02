import { Router } from 'express';
import {AdminApiRouter} from './adminAPI/index.js';
import {UserApiRouter} from './userAPI/index.js';

const router = Router();

// Prefix all routes defined in the api directory with `/api`
router.use('/adminApi', AdminApiRouter);
router.use('/userApi', UserApiRouter);

export default router;
