/**
 * Bright MLS API Client
 *
 * LEARNING: RESO Web API uses OData $filter and $select
 * WHY: Fetch property data by address for booking wizard enrichment
 * PATTERN: External proxy; server holds credentials
 *
 * RESOURCE: https://reso.org/blog/web-api-example/filter-for-specific-property-7
 */

import { createLogger } from '../../utils/logger.js';
import {
  type BrightMlsPropertyResponse,
  type BrightMlsODataResponse,
} from '../../types/brightMls.js';
import { getAccessToken } from './brightMlsAuth.js';

const logger = createLogger('BrightMlsApiClient');

/**
 * Rate limit: 2 req/sec, 40K/day (configurable via env)
 */
const RATE_LIMIT_PER_SECOND = parseInt(
  process.env.BRIGHT_MLS_RATE_LIMIT_PER_SECOND || '2',
  10
);
const RATE_LIMIT_PER_DAY = parseInt(
  process.env.BRIGHT_MLS_RATE_LIMIT_PER_DAY || '40000',
  10
);

let lastRequestAt = 0;
let requestsToday = 0;
let dayResetAt = Date.now() + 24 * 60 * 60 * 1000;

function applyRateLimit(): void {
  const now = Date.now();
  if (now >= dayResetAt) {
    requestsToday = 0;
    dayResetAt = now + 24 * 60 * 60 * 1000;
  }
  if (requestsToday >= RATE_LIMIT_PER_DAY) {
    throw new Error('Bright MLS daily rate limit exceeded');
  }
  const elapsed = now - lastRequestAt;
  const minInterval = 1000 / RATE_LIMIT_PER_SECOND;
  if (elapsed < minInterval && lastRequestAt > 0) {
    const wait = minInterval - elapsed;
    lastRequestAt = now + wait;
    return; // Caller should await before next request; we don't block here
  }
  lastRequestAt = now;
  requestsToday += 1;
}

/**
 * Build OData $filter from address components
 */
function buildFilter(
  streetNumber: string,
  streetName: string,
  city: string,
  state: string,
  zipCode: string
): string {
  const parts: string[] = [];

  if (streetNumber?.trim()) {
    parts.push(`(StreetNumber eq '${escapeODataString(streetNumber.trim())}')`);
  }
  if (streetName?.trim()) {
    parts.push(`(StreetName eq '${escapeODataString(streetName.trim())}')`);
  }
  if (city?.trim()) {
    parts.push(`(City eq '${escapeODataString(city.trim())}')`);
  }
  if (state?.trim()) {
    parts.push(
      `(StateOrProvince eq '${escapeODataString(state.trim().toUpperCase())}')`
    );
  }
  if (zipCode?.trim()) {
    parts.push(
      `(PostalCode eq '${escapeODataString(zipCode.trim())}')`
    );
  }

  if (parts.length === 0) {
    return '';
  }
  return parts.join(' and ');
}

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

const SELECT_FIELDS = [
  'ListingKey',
  'ListingId',
  'LivingArea',
  'AboveGradeFinishedArea',
  'BelowGradeFinishedArea',
  'BedroomsTotal',
  'BathroomsFull',
  'BathroomsHalf',
  'FoundationDetails',
  'PoolFeatures',
  'PatioAndPorchFeatures',
  'OtherStructures',
  'GarageSpaces',
  'StreetNumber',
  'StreetName',
  'City',
  'StateOrProvince',
  'PostalCode',
  'PropertySubType',
  'UnitTypes',
  'FireplaceFeatures',
].join(',');

/**
 * Search property by address via Bright MLS RESO Web API
 *
 * @param address - Full address string (fallback if components missing)
 * @param city - City
 * @param state - State or province code
 * @param zipCode - Postal code
 * @returns First matching property or null if not found
 */
export async function searchPropertyByAddress(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<BrightMlsPropertyResponse | null> {
  const baseUrl = process.env.BRIGHT_MLS_API_URL?.trim();
  if (!baseUrl) {
    logger.warn('BRIGHT_MLS_API_URL not configured');
    return null;
  }

  const token = await getAccessToken();
  if (!token) {
    logger.debug('Bright MLS not configured or token unavailable');
    return null;
  }

  // Parse address into street number and name if not provided
  const streetParts = parseStreetAddress(address);
  const streetNumber = streetParts.number;
  const streetName = streetParts.name || address.trim();

  const filter = buildFilter(streetNumber, streetName, city, state, zipCode);
  if (!filter) {
    logger.warn('Insufficient address components for Bright MLS lookup');
    return null;
  }

  applyRateLimit();

  const url = new URL(
    baseUrl.endsWith('/') ? `${baseUrl}Property` : `${baseUrl}/Property`
  );
  url.searchParams.set('$filter', filter);
  url.searchParams.set('$select', SELECT_FIELDS);
  url.searchParams.set('$top', '1');

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (response.status === 404) {
      return null;
    }
    if (response.status === 401) {
      logger.warn('Bright MLS auth failed (401)');
      return null;
    }
    if (response.status === 429) {
      logger.warn('Bright MLS rate limited (429)');
      throw new Error('Bright MLS rate limit exceeded');
    }
    if (!response.ok) {
      logger.error('Bright MLS API error', {
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const data = (await response.json()) as BrightMlsODataResponse;
    const value = data.value;
    if (!Array.isArray(value) || value.length === 0) {
      return null;
    }

    return value[0] as BrightMlsPropertyResponse;
  } catch (error) {
    logger.error(error)
    if (error instanceof Error && error.message.includes('rate limit')) {
      throw error;
    }
    logger.error('Bright MLS API request failed', { error });
    return null;
  }
}

/**
 * Parse street address into number and name
 * Simple heuristic: leading digits = street number
 */
function parseStreetAddress(address: string): {
  number: string;
  name: string;
} {
  const trimmed = address.trim();
  const match = trimmed.match(/^(\d+[\w\-.]*)\s+(.+)$/);
  if (match) {
    return { number: match[1], name: match[2] };
  }
  return { number: trimmed, name: trimmed };
}
