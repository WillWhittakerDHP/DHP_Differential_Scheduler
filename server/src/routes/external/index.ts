import { Router } from 'express';
import { CalendarRouter } from './calendarRoutes.js';
import { GoogleOAuthRouter } from './googleOauthRoutes.js';
import { MapsRouter } from './mapsRoutes.js';
import { PropertyEnrichmentRouter } from './propertyEnrichmentRoutes.js';

/**
 * External Routes
 * 
 */

const router = Router();

router.use('/calendar', CalendarRouter);

router.use('/oauth', GoogleOAuthRouter);

router.use('/maps', MapsRouter);

router.use('/', PropertyEnrichmentRouter);

export { router as ExternalRouter };