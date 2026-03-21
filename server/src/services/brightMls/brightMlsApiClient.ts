import { createLogger } from '../../utils/logger.js';
import type {
  BrightMlsPropertyResponse,
  BrightMlsODataResponse,
} from '../../types/brightMls.js';
import { getAccessToken } from './brightMlsAuth.js';

const logger = createLogger('BrightMlsApiClient');

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
    return;
  }
  lastRequestAt = now;
  requestsToday += 1;
}

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

const FILTER_FIELD_SPECS: ReadonlyArray<{
  value: string;
  field: string;
  transform?: (v: string) => string;
}> = [
  { value: '', field: 'StreetNumber' },
  { value: '', field: 'StreetName' },
  { value: '', field: 'City' },
  { value: '', field: 'StateOrProvince', transform: (v: string) => v.toUpperCase() },
  { value: '', field: 'PostalCode' },
];

function buildFilter(
  streetNumber: string,
  streetName: string,
  city: string,
  state: string,
  zipCode: string
): string {
  const values = [streetNumber, streetName, city, state, zipCode];
  const parts = FILTER_FIELD_SPECS
    .map((spec, i) => ({ ...spec, value: values[i] != null ? String(values[i]).trim() : '' }))
    .filter((item) => item.value !== '')
    .map((item) => {
      const raw = item.value;
      const v = item.transform ? item.transform(raw) : raw;
      return `(${item.field} eq '${escapeODataString(v)}')`;
    });
  return parts.length === 0 ? '' : parts.join(' and ');
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

async function validateBrightMlsConfig(): Promise<{
  baseUrl: string;
  token: string;
} | null> {
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
  return { baseUrl, token };
}

async function handleBrightMlsResponse(
  response: Response
): Promise<BrightMlsPropertyResponse | null> {
  if (response.status === 404) return null;
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
  if (!Array.isArray(value) || value.length === 0) return null;
  return value[0] as BrightMlsPropertyResponse;
}

function parseStreetAddress(address: string): { number: string; name: string } {
  const trimmed = address.trim();
  const match = trimmed.match(/^(\d+[\w\-.]*)\s+(.+)$/);
  if (match) return { number: match[1], name: match[2] };
  return { number: trimmed, name: trimmed };
}

export async function searchPropertyByAddress(
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<BrightMlsPropertyResponse | null> {
  const config = await validateBrightMlsConfig();
  if (!config) return null;

  const streetParts = parseStreetAddress(address);
  const streetNumber = streetParts.number;
  const streetName = streetParts.name || address.trim();
  const filter = buildFilter(streetNumber, streetName, city, state, zipCode);
  if (!filter) {
    logger.warn('Insufficient address components for Bright MLS lookup');
    return null;
  }

  applyRateLimit();

  const baseUrl = config.baseUrl.endsWith('/') ? `${config.baseUrl}Property` : `${config.baseUrl}/Property`;
  const url = new URL(baseUrl);
  url.searchParams.set('$filter', filter);
  url.searchParams.set('$select', SELECT_FIELDS);
  url.searchParams.set('$top', '1');

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/json',
      },
    });
    return await handleBrightMlsResponse(response);
  } catch (error) {
    logger.error(error);
    if (error instanceof Error && error.message.includes('rate limit')) {
      throw error;
    }
    logger.error('Bright MLS API request failed', { error });
    return null;
  }
}
