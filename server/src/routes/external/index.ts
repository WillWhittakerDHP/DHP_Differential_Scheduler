import { Router } from 'express';
import { CalendarRouter } from './calendarRoutes.js';
import { GoogleOAuthRouter } from './googleOauthRoutes.js';

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

export { router as ExternalRouter };