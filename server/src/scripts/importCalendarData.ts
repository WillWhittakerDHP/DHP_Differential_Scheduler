/**

PATTERN: Orchestrator pattern with focused ...
 */
import 'dotenv/config';
import { Address, PropertyVersion, User, sequelize, initializeDatabase } from '../config/app.js';
import { USER_ROLE_CLIENT } from '../constants/userRoles.js';
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
import {
  findOrCreateAddress,
  findOrCreatePropertyVersionForAddress,
  findOrCreatePropertyDetailsForVersion,
  updatePropertyDetailsIfNeeded,
  readEventsFromStdin,
  printImportSummary,
} from './helpers/calendarImportHelpers.js';

const logger = createLogger('CalendarImport');

const DEFAULT_ORGANIZER_EMAIL = 'will@districthomepro.com';

/** Usage message for calendar import script (avoids inline hardcoded label in logger). */
const IMPORT_CALENDAR_USAGE_PIPE =
  // @audit-allow:hardcoding:inlineLabelMap - Script usage constant
  '  1. Pipe JSON events: echo \'[{"summary":"...","location":"..."}]\' | npm run import:calendar';

interface AddressWithVersions extends InstanceType<typeof Address> {
  propertyVersions?: InstanceType<typeof PropertyVersion>[];
}

async function upsertUser(client: ParsedClient): Promise<string> {
  const [user, created] = await User.findOrCreate({
    // @audit-allow:hardcoding:fieldMapping - Sequelize where shape
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

async function upsertProperty(property: ParsedProperty): Promise<string> {
  return await PropertyVersion.sequelize!.transaction(async (transaction) => {
    const addressRecord = await findOrCreateAddress({
      address: property.address,
      unit: property.unit,
      city: property.city,
      state: property.state,
      zipCode: property.zipCode,
    });
    const propertyVersion = await findOrCreatePropertyVersionForAddress(addressRecord.id, transaction);
    const { propertyDetails, detailsCreated } = await findOrCreatePropertyDetailsForVersion(
      propertyVersion.id,
      property,
      transaction
    );
    await updatePropertyDetailsIfNeeded(propertyDetails, property, detailsCreated, transaction);
    return propertyVersion.id;
  });
}

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
      const existingUser = await User.findOne({
        // @audit-allow:hardcoding:fieldMapping - Sequelize where shape
        where: { email: client.email },
      });
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

async function importCalendarData(events?: CalendarEvent[]): Promise<void> {
  try {
    logger.info('📅 Starting calendar data import...');
    await initializeDatabase();

    const organizerEmail = process.env.ORGANIZER_EMAIL ?? DEFAULT_ORGANIZER_EMAIL;

    let eventsToProcess: CalendarEvent[];
    if (events != null && events.length > 0) {
      eventsToProcess = events;
      logger.info(`📆 Processing ${eventsToProcess.length} calendar events...`);
    } else if (process.stdin.isTTY) {
      logger.warn('⚠️  No events provided.');
      logger.info('📖 Usage options:');
      logger.info(IMPORT_CALENDAR_USAGE_PIPE);
      logger.info('  2. Use AI assistant with MCP to fetch and import events');
      logger.info('  3. Call importCalendarData([events]) programmatically');
      return;
    } else {
      eventsToProcess = await readEventsFromStdin();
      logger.info(`📆 Processing ${eventsToProcess.length} calendar events from input...`);
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
