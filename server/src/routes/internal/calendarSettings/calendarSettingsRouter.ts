import { Router } from 'express';
import { CalendarSettingsCrudRouter } from './calendarSettingsCrudRouter.js';

const router = Router();
router.use('/', CalendarSettingsCrudRouter);

export { router as CalendarSettingsRouter };
