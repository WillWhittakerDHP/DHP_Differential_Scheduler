import { Router } from 'express';
import { CalendarRouter } from './calendarRoutes.js';
import { GoogleOAuthRouter } from './googleOauthRoutes.js';
import { MapsRouter } from './mapsRoutes.js';

/**
 * External Routes
 * 
 * LEARNING: Routes for external API integrations (Google Calendar, Maps, etc.)
 * WHY: Separates external API routes from internal application routes
 * PATTERN: Router composition with route mounting
 */

const router = Router();

// Mount calendar routes
router.use('/calendar', CalendarRouter);

// Mount OAuth routes
router.use('/oauth', GoogleOAuthRouter);

// Mount maps routes (Session 2.2.1)
router.use('/maps', MapsRouter);

export { router as ExternalRouter };