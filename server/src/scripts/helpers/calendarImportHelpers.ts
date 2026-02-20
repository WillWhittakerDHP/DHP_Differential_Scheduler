/**
 * Calendar Import Helpers
 *
 * LEARNING: Extracted upsert and property-details logic from importCalendarData.ts
 * WHY: Reduces main script size, lowers function complexity, centralizes field mappings
 * PATTERN: Small async helpers used in sequence inside a transaction
 */

import type { Transaction } from 'sequelize';
import { Address, PropertyVersion, PropertyDetails } from '../../config/app.js';
import { DEFAULT_VALUES as PROPERTY_DEFAULT_VALUES } from '../../routes/internal/properties/propertyConstants.js';
import { createLogger } from '../../utils/logger.js';
import type { CalendarEvent, ParsedProperty } from './calendarParsingHelpers.js';

const logger = createLogger('calendarImportHelpers');

/** Shape for PropertyDetails update from ParsedProperty (single place for field list). */
type PropertyDetailsUpdateShape = Partial<{
  mlsNumber: string | null;
  squareFootage: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  foundationAccess: 'basement' | 'crawlspace' | 'slab' | null;
  additionalUnits: number | null;
}>;

/**
 * Build property details update object from parsed property (avoids inline fieldMapping).
 */
export function buildPropertyDetailsUpdates(property: ParsedProperty): PropertyDetailsUpdateShape {
  const updates: PropertyDetailsUpdateShape = {};
  if (property.mlsNumber != null) updates.mlsNumber = property.mlsNumber;
  if (property.squareFootage != null) updates.squareFootage = property.squareFootage;
  if (property.bedrooms != null) updates.bedrooms = property.bedrooms;
  if (property.bathrooms != null) updates.bathrooms = property.bathrooms;
  if (property.foundationAccess != null) updates.foundationAccess = property.foundationAccess;
  if (property.additionalUnits != null) updates.additionalUnits = property.additionalUnits;
  return updates;
}

/**
 * Find or create Address (reused pattern from propertyRouter).
 */
export async function findOrCreateAddress(addressData: {
  address: string;
  unit?: string | null;
  city: string;
  state: string;
  zipCode: string;
}): Promise<InstanceType<typeof Address>> {
  const existingAddress = await Address.findOne({
    where: {
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      unit: addressData.unit ?? null,
    },
  });

  if (existingAddress) {
    if (addressData.unit != null && existingAddress.unit !== addressData.unit) {
      await existingAddress.update({ unit: addressData.unit });
    }
    return existingAddress;
  }

  return await Address.create({
    address: addressData.address,
    unit: addressData.unit ?? null,
    city: addressData.city,
    state: addressData.state,
    zipCode: addressData.zipCode,
  });
}

/**
 * Find or create PropertyVersion for an Address (inside transaction).
 */
export async function findOrCreatePropertyVersionForAddress(
  addressId: string,
  transaction: Transaction
): Promise<InstanceType<typeof PropertyVersion>> {
  let propertyVersion = await PropertyVersion.findOne({
    where: { addressId },
    transaction,
  });
  if (!propertyVersion) {
    propertyVersion = await PropertyVersion.create(
      { addressId },
      { transaction }
    );
  }
  return propertyVersion;
}

/**
 * Find or create PropertyDetails for a PropertyVersion (inside transaction).
 */
export async function findOrCreatePropertyDetailsForVersion(
  propertyVersionId: string,
  property: ParsedProperty,
  transaction: Transaction
): Promise<{
  propertyDetails: InstanceType<typeof PropertyDetails>;
  detailsCreated: boolean;
}> {
  const [propertyDetails, detailsCreated] = await PropertyDetails.findOrCreate({
    where: { propertyVersionId },
    defaults: {
      propertyVersionId,
      source: PROPERTY_DEFAULT_VALUES.SOURCE,
      mlsNumber: property.mlsNumber,
      squareFootage: property.squareFootage,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      foundationAccess: property.foundationAccess,
      additionalUnits: property.additionalUnits,
    },
    transaction,
  });
  return { propertyDetails, detailsCreated };
}

/**
 * Update existing PropertyDetails if updates are present (inside transaction).
 */
export async function updatePropertyDetailsIfNeeded(
  propertyDetails: InstanceType<typeof PropertyDetails>,
  property: ParsedProperty,
  detailsCreated: boolean,
  transaction: Transaction
): Promise<void> {
  if (detailsCreated) return;
  const updates = buildPropertyDetailsUpdates(property);
  if (Object.keys(updates).length > 0) {
    await propertyDetails.update(updates, { transaction });
  }
}

/** Stats shape for import summary. */
export interface ImportStats {
  clientsImported: number;
  propertiesImported: number;
  clientsUpdated: number;
  propertiesUpdated: number;
}

/**
 * Read calendar events from stdin (for CLI usage).
 */
export async function readEventsFromStdin(): Promise<CalendarEvent[]> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const inputData = Buffer.concat(chunks).toString('utf-8');
  if (!inputData.trim()) {
    throw new Error('No events provided in stdin');
  }
  try {
    return JSON.parse(inputData) as CalendarEvent[];
  } catch (parseError) {
    logger.error('Failed to parse JSON input:', parseError);
    logger.info('💡 Usage: echo \'[{"summary":"...","location":"..."}]\' | npm run import:calendar');
    throw parseError;
  }
}

/**
 * Print import summary statistics to logger.
 */
export function printImportSummary(stats: ImportStats, eventCount: number): void {
  logger.info('\n📊 Import Summary:');
  logger.info(`  ✅ Clients imported: ${stats.clientsImported}`);
  logger.info(`  🔄 Clients updated: ${stats.clientsUpdated}`);
  logger.info(`  ✅ Properties imported: ${stats.propertiesImported}`);
  logger.info(`  🔄 Properties updated: ${stats.propertiesUpdated}`);
  logger.info(`  📝 Total events processed: ${eventCount}`);
}
