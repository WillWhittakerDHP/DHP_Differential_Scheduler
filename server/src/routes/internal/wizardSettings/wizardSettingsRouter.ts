import { Router } from 'express';
import { WizardSettingsCrudRouter } from './wizardSettingsCrudRouter.js';

const router = Router();
router.use('/', WizardSettingsCrudRouter);

export { router as WizardSettingsRouter };
