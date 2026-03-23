import { Router } from 'express';
import { WizardSettingsCrudRouter } from './wizardSettingsCrudRouter.js';
import { WizardSettingsLogoUploadRouter } from './wizardSettingsLogoUploadRouter.js';

const router = Router();
router.use('/', WizardSettingsCrudRouter);
router.use('/', WizardSettingsLogoUploadRouter);

export { router as WizardSettingsRouter };
