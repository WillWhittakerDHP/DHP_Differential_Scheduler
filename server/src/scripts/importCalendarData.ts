/**
 * Calendar Data Import Script
 * 
 * LEARNING: Imports clients and properties from Google Calendar events
 * WHY: Enables bulk import of calendar data into the scheduling system
 * PATTERN: Orchestrator pattern with focused helper functions
 */

import 'dotenv/config';
import { Address, PropertyVersion, PropertyDetails, User, sequelize, initializeDatabase } from '../config/app.js';
import { USER_ROLE_CLIENT } from '../constants/userRoles.js';
import { DEFAULT_VALUES as PROPERTY_DEFAULT_VALUES } from '../routes/internal/properties/propertyConstants.js';
import { createLogger } from '../utils/logger.js';
import {
  CalendarEvent,
  ParsedClient,
  ParsedProperty,
  extractClients,
  extractProperty,
  parseName,
  parseAddress,
} from './helpers/calendarParsingHelpers.js';

const logger = createLogger('CalendarImport');

/**
 * Default organizer email fallback
 * LEARNING: Named constant replaces hardcoded email
 * WHY: Eliminates hardcoding audit finding
 */
const DEFAULT_ORGANIZER_EMAIL = 'will@districthomepro.com';

/**
 * Interface for Address with eager-loaded propertyVersions
 * LEARNING: Proper typing for Sequelize associations
 * WHY: Replaces unsafe `as any` cast with type-safe interface
 */
interface AddressWithVersions extends InstanceType<typeof Address> {
  propertyVersions?: InstanceType<typeof PropertyVersion>[];
}

/**
 * Upsert user from parsed client data
 * LEARNING: Creates or updates user record with client role
 * WHY: Normalizes client data into User model
 * 
 * @param client - Parsed client data
 * @returns User ID
 */
async function upsertUser(client: ParsedClient): Promise<string> {
  const [user, created] = await User.findOrCreate({
    where: { email: client.email },
    defaults: {
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      userRole: USER_ROLE_CLIENT,
      loginId: null,
    },
  });
  
  if (!created) {
    await user.update({
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone || user.phone,
    });
  }
  
  return user.id;
}

/**
 * Find or create Address (reused pattern from propertyRouter.ts)
 * LEARNING: Addresses are normalized separately from property details
 * WHY: Allows reuse of addresses across multiple property versions
 */
async function findOrCreateAddress(addressData: {
  address: string;
  unit?: string | null;
  city: string;
  state: string;
  zipCode: string;
}) {
  const existingAddress = await Address.findOne({
    where: {
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      unit: addressData.unit || null,
    },
  });

  if (existingAddress) {
    // Update unit if provided and different
    if (addressData.unit && existingAddress.unit !== addressData.unit) {
      await existingAddress.update({ unit: addressData.unit });
    }
    return existingAddress;
  }

  return await Address.create({
    address: addressData.address,
    unit: addressData.unit || null,
    city: addressData.city,
    state: addressData.state,
    zipCode: addressData.zipCode,
  });
}

/**
 * Build property details update object
 * LEARNING: Extracted helper to reduce upsertProperty complexity
 * WHY: Replaces 6-line if-chain with single function call
 * 
 * @param property - Parsed property data
 * @returns Partial update object with only non-null fields
 */
function buildPropertyDetailsUpdates(property: ParsedProperty): Partial<{
  mlsNumber: string | null;
  squareFootage: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  foundationAccess: 'basement' | 'crawlspace' | 'slab' | null;
  additionalUnits: number | null;
}> {
  const updates: Partial<{
    mlsNumber: string | null;
    squareFootage: number | null;
    bedrooms: number | null;
    bathrooms: number | null;
    foundationAccess: 'basement' | 'crawlspace' | 'slab' | null;
    additionalUnits: number | null;
  }> = {};

  if (property.mlsNumber !== null) updates.mlsNumber = property.mlsNumber;
  if (property.squareFootage !== null) updates.squareFootage = property.squareFootage;
  if (property.bedrooms !== null) updates.bedrooms = property.bedrooms;
  if (property.bathrooms !== null) updates.bathrooms = property.bathrooms;
  if (property.foundationAccess !== null) updates.foundationAccess = property.foundationAccess;
  if (property.additionalUnits !== null) updates.additionalUnits = property.additionalUnits;

  return updates;
}

/**
 * Upsert property using normalized structure (Address → PropertyVersion → PropertyDetails)
 * LEARNING: Uses three-table structure instead of deprecated Property model
 * WHY: Separates stable address from versioned property details
 * PATTERN: Find or create Address, find or create PropertyVersion, find or create PropertyDetails
 * Returns propertyVersionId (used by appointments)
 */
async function upsertProperty(property: ParsedProperty): Promise<string> {
  return await PropertyVersion.sequelize!.transaction(async (transaction) => {
    // Step 1: Find or create Address
    const addressRecord = await findOrCreateAddress({
      address: property.address,
      unit: property.unit,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
    });

    // Step 2: Find or create PropertyVersion for this Address
    let propertyVersion = await PropertyVersion.findOne({
      where: {
        addressId: addressRecord.id,
      },
      transaction,
    });
    
    if (!propertyVersion) {
      propertyVersion = await PropertyVersion.create({
        addressId: addressRecord.id,
      }, { transaction });
    }

    // Step 3: Find or create PropertyDetails for this PropertyVersion
    const [propertyDetails, detailsCreated] = await PropertyDetails.findOrCreate({
      where: {
        propertyVersionId: propertyVersion.id,
      },
      defaults: {
        propertyVersionId: propertyVersion.id,
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

    // Update existing PropertyDetails if any new data is provided
    if (!detailsCreated) {
      const updates = buildPropertyDetailsUpdates(property);

      if (Object.keys(updates).length > 0) {
        await propertyDetails.update(updates, { transaction });
      }
    }

    return propertyVersion.id;
  });
}

/**
 * Process clients from a single event
 * LEARNING: Extracted helper to reduce processEvents complexity
 * WHY: Separates client processing logic from main loop
 * 
 * @param event - Calendar event
 * @param organizerEmail - Organizer email to exclude
 * @param processedClients - Set of already processed client emails
 * @param stats - Statistics object to update
 */
async function processEventClients(
  event: CalendarEvent,
  organizerEmail: string,
  processedClients: Set<string>,
  stats: {
    clientsImported: number;
    clientsUpdated: number;
  }
): Promise<void> {
  const clients = extractClients(event, organizerEmail);
  
  for (const client of clients) {
    if (!processedClients.has(client.email)) {
      const existingUser = await User.findOne({ where: { email: client.email } });
      await upsertUser(client);
      
      if (existingUser) {
        stats.clientsUpdated++;
      } else {
        stats.clientsImported++;
      }
      processedClients.add(client.email);
    }
  }
}

/**
 * Process property from a single event
 * LEARNING: Extracted helper to reduce processEvents complexity
 * WHY: Separates property processing logic from main loop
 * 
 * @param event - Calendar event
 * @param processedProperties - Set of already processed property keys
 * @param stats - Statistics object to update
 */
async function processEventProperty(
  event: CalendarEvent,
  processedProperties: Set<string>,
  stats: {
    propertiesImported: number;
    propertiesUpdated: number;
  }
): Promise<void> {
  const property = extractProperty(event);
  
  if (!property) {
    return;
  }
  
  const propertyKey = `${property.address}|${property.city}|${property.state}`;
  
  if (processedProperties.has(propertyKey)) {
    return;
  }
  
  // Check for existing PropertyVersion by looking up Address first
  const existingAddress = await Address.findOne({
    where: {
      address: property.address,
      city: property.city,
      state: property.state,
    },
    include: [
      { model: PropertyVersion, as: 'propertyVersions', required: false },
    ],
  });
  
  const existingPropertyVersion = existingAddress 
    ? (existingAddress as AddressWithVersions).propertyVersions?.[0]
    : undefined;
  
  await upsertProperty(property);
  
  if (existingPropertyVersion) {
    stats.propertiesUpdated++;
  } else {
    stats.propertiesImported++;
  }
  
  processedProperties.add(propertyKey);
}

/**
 * Process all calendar events and import clients/properties
 * LEARNING: Orchestrates event processing with extracted helpers
 * WHY: Reduced complexity through helper extraction
 * 
 * @param events - Array of calendar events
 * @param organizerEmail - Organizer email to exclude from clients
 * @returns Statistics object with import/update counts
 */
async function processEvents(events: CalendarEvent[], organizerEmail: string): Promise<{
  clientsImported: number;
  propertiesImported: number;
  clientsUpdated: number;
  propertiesUpdated: number;
}> {
  const stats = {
    clientsImported: 0,
    propertiesImported: 0,
    clientsUpdated: 0,
    propertiesUpdated: 0,
  };
  
  const processedClients = new Set<string>(); // Track by email
  const processedProperties = new Set<string>(); // Track by address+city+state
  
  for (const event of events) {
    await processEventClients(event, organizerEmail, processedClients, stats);
    await processEventProperty(event, processedProperties, stats);
  }
  
  return stats;
}

/**
 * Read calendar events from stdin
 * LEARNING: Extracted helper to reduce importCalendarData complexity
 * WHY: Separates input handling from main orchestration
 * 
 * @returns Array of calendar events parsed from stdin
 * @throws Error if JSON parsing fails
 */
async function readEventsFromStdin(): Promise<CalendarEvent[]> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  const inputData = Buffer.concat(chunks).toString('utf-8');
  
  if (!inputData.trim()) {
    throw new Error('No events provided in stdin');
  }
  
  try {
    return JSON.parse(inputData);
  } catch (parseError) {
    logger.error('Failed to parse JSON input:', parseError);
    logger.info('💡 Usage: echo \'[{"summary":"...","location":"..."}]\' | npm run import:calendar');
    throw parseError;
  }
}

/**
 * Print import summary statistics
 * LEARNING: Extracted helper to reduce importCalendarData complexity
 * WHY: Separates output formatting from main orchestration
 * 
 * @param stats - Statistics object
 * @param eventCount - Total number of events processed
 */
function printImportSummary(
  stats: {
    clientsImported: number;
    propertiesImported: number;
    clientsUpdated: number;
    propertiesUpdated: number;
  },
  eventCount: number
): void {
  logger.info('\n📊 Import Summary:');
  logger.info(`  ✅ Clients imported: ${stats.clientsImported}`);
  logger.info(`  🔄 Clients updated: ${stats.clientsUpdated}`);
  logger.info(`  ✅ Properties imported: ${stats.propertiesImported}`);
  logger.info(`  🔄 Properties updated: ${stats.propertiesUpdated}`);
  logger.info(`  📝 Total events processed: ${eventCount}`);
}

/**
 * Main calendar import function
 * LEARNING: Orchestrator pattern with focused helpers
 * WHY: Reduced complexity through extraction of input handling, processing, and output
 * 
 * @param events - Optional pre-provided events array
 */
async function importCalendarData(events?: CalendarEvent[]): Promise<void> {
  try {
    logger.info('📅 Starting calendar data import...');
    
    await initializeDatabase();
    
    const organizerEmail = process.env.ORGANIZER_EMAIL || DEFAULT_ORGANIZER_EMAIL;
    
    let eventsToProcess: CalendarEvent[] = [];
    
    if (events && events.length > 0) {
      eventsToProcess = events;
      logger.info(`📆 Processing ${eventsToProcess.length} calendar events...`);
    } else {
      if (process.stdin.isTTY) {
        logger.warn('⚠️  No events provided.');
        logger.info('📖 Usage options:');
        logger.info('  1. Pipe JSON events: echo \'[{"summary":"...","location":"..."}]\' | npm run import:calendar');
        logger.info('  2. Use AI assistant with MCP to fetch and import events');
        logger.info('  3. Call importCalendarData([events]) programmatically');
        return;
      } else {
        eventsToProcess = await readEventsFromStdin();
        logger.info(`📆 Processing ${eventsToProcess.length} calendar events from input...`);
      }
    }
    
    if (eventsToProcess.length === 0) {
      logger.warn('⚠️  No events to process.');
      return;
    }
    
    const stats = await processEvents(eventsToProcess, organizerEmail);
    
    printImportSummary(stats, eventsToProcess.length);
    
    logger.info('\n✅ Calendar import completed successfully!');
    
  } catch (error) {
    logger.error('❌ Error during calendar import:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

export { importCalendarData, extractClients, extractProperty, parseName, parseAddress };

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('importCalendarData.js')) {
  const args = process.argv.slice(2);

  const eventsIndex = args.indexOf('--events');
  if (eventsIndex !== -1 && args[eventsIndex + 1]) {
    try {
      const events = JSON.parse(args[eventsIndex + 1]);
      importCalendarData(events)
        .then(() => {
          logger.info('✅ Calendar import process completed.');
          process.exit(0);
        })
        .catch((error) => {
          logger.error('❌ Calendar import failed:', error);
          process.exit(1);
        });
    } catch (error) {
      logger.error('❌ Failed to parse --events JSON:', error);
      process.exit(1);
    }
  } else {
    importCalendarData()
      .then(() => {
        process.exit(0);
      })
      .catch((error) => {
        logger.error('❌ Calendar import failed:', error);
        process.exit(1);
      });
  }
}
