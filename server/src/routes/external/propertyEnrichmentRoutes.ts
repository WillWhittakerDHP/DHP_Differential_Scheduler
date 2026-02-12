/**
 * Property Enrichment Routes
 *
 * LEARNING: Proxy for Bright MLS / RESO property lookup
 * WHY: Server holds credentials; client receives transformed enrichment data
 * PATTERN: GET route, cache-first, 503 when not configured
 */

import { Router, Request, Response } from 'express';
import { createLogger } from '../../utils/logger.js';
import { isBrightMlsConfigured } from '../../services/brightMls/brightMlsAuth.js';
import { searchPropertyByAddress } from '../../services/brightMls/brightMlsApiClient.js';
import { transformToPropertyEnrichment } from '../../services/brightMls/brightMlsTransformer.js';
import {
  getCachedEnrichment,
  cacheEnrichment,
  normalizeAddressForCache,
} from '../../services/propertyEnrichmentCache.js';
import { PropertyFieldMapping, PropertyFeatureMapping } from '../../config/models.js';

const logger = createLogger('PropertyEnrichmentRoutes');

const router = Router();

/**
 * Parse address string into components (simple US format)
 * Handles "123 Main St, City, ST 12345" or "123 Main St, City, ST 12345-6789"
 */
function parseAddressComponents(address: string): {
  street: string;
  city: string;
  state: string;
  zipCode: string;
} {
  const trimmed = address.trim();
  const match = trimmed.match(
    /^(.+?),\s*([^,]+?),\s*([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\s*$/
  );
  if (match) {
    return {
      street: match[1].trim(),
      city: match[2].trim(),
      state: match[3].trim(),
      zipCode: match[4].trim(),
    };
  }
  // Fallback: use whole address as street, empty rest
  return {
    street: trimmed,
    city: '',
    state: '',
    zipCode: '',
  };
}

router.get(
  '/property-enrichment',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const addressParam = req.query.address;
      const address = typeof addressParam === 'string' ? addressParam.trim() : '';

      if (!address) {
        res.status(400).json({
          error: 'Missing address query parameter',
          type: 'invalid',
        });
        return;
      }

      if (!isBrightMlsConfigured()) {
        res.status(503).json({
          error: 'Property enrichment service not configured',
          type: 'not_configured',
        });
        return;
      }

      const normalized = normalizeAddressForCache(address);
      const cached = getCachedEnrichment(normalized);
      if (cached) {
        res.json(cached);
        return;
      }

      const { street, city, state, zipCode } = parseAddressComponents(address);
      const cityOverride = req.query.city as string | undefined;
      const stateOverride = req.query.state as string | undefined;
      const zipOverride = req.query.zipCode as string | undefined;

      const finalCity = cityOverride?.trim() || city;
      const finalState = stateOverride?.trim() || state;
      const finalZip = zipOverride?.trim() || zipCode;

      const raw = await searchPropertyByAddress(
        street,
        finalCity,
        finalState,
        finalZip
      );

      if (!raw) {
        res.status(404).json({
          error: 'No listing found for address',
          type: 'not_found',
        });
        return;
      }

      const [fieldMappings, featureMappings] = await Promise.all([
        PropertyFieldMapping.findAll({
          where: {
            dataSource: 'bright_mls',
            active: true,
          },
        }),
        PropertyFeatureMapping.findAll({
          where: {
            dataSource: 'bright_mls',
            active: true,
          },
          order: [['priority', 'DESC']],
        }),
      ]);

      const enriched = transformToPropertyEnrichment(
        raw,
        fieldMappings,
        featureMappings
      );

      cacheEnrichment(normalized, enriched);
      res.json(enriched);
    } catch (error) {
      if (error instanceof Error && error.message.includes('rate limit')) {
        res.status(429).json({
          error: 'Property enrichment rate limit exceeded',
          type: 'rate_limit',
        });
        return;
      }
      logger.error('Property enrichment error', { error });
      res.status(500).json({
        error: 'Property enrichment failed',
        type: 'internal',
      });
    }
  }
);

export { router as PropertyEnrichmentRouter };
