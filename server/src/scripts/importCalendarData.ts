/**
 * Calendar Data Import Script
 * 
 * This script imports client and property data from Google Calendar appointments
 * into the database, replacing or supplementing dummy seed data.
 * 
 * Usage:
 *   npm run import:calendar [-- --days=30]
 * 
 * The script:
 * 1. Fetches calendar events from Google Calendar via MCP
 * 2. Extracts client information from event attendees
 * 3. Extracts property addresses from event locations/descriptions
 * 4. Upserts data into User and Property tables
 * 
 * Note: This script requires Google Calendar MCP to be configured in Cursor.
 * See MCP_SETUP_GUIDE.md for setup instructions.
 */

import 'dotenv/config';
import { Property, User, sequelize, initializeDatabase } from '../config/app.js';

interface CalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  attendees?: Array<{
    email?: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  organizer?: {
    email?: string;
    displayName?: string;
  };
}

interface ParsedClient {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

interface ParsedProperty {
  address: string;
  unit: string | null;
  city: string;
  state: string;
  zipCode: string;
  mlsNumber: string | null;
  squareFootage: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  foundationAccess: 'basement' | 'crawlspace' | 'slab' | null;
  additionalUnits: number | null;
}

/**
 * Parse a full name into first and last name
 * Handles various name formats: "John Smith", "John M. Smith", "Smith, John", etc.
 */
function parseName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  
  // Handle "Last, First" format
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      return {
        lastName: parts[0],
        firstName: parts[1].split(' ')[0] || parts[1],
      };
    }
  }
  
  // Handle "First Last" or "First Middle Last" format
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

/**
 * Extract phone number from text (various formats)
 */
function extractPhone(text: string | undefined): string | null {
  if (!text) return null;
  
  // Match common phone formats: (555) 123-4567, 555-123-4567, 555.123.4567, etc.
  const phoneRegex = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/;
  const match = text.match(phoneRegex);
  return match ? match[1].replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') : null;
}

/**
 * Parse address string into structured property data
 * Handles various address formats and extracts city, state, zip
 */
function parseAddress(addressString: string): ParsedProperty | null {
  if (!addressString || addressString.trim().length === 0) {
    return null;
  }
  
  // Common address patterns:
  // "123 Main St, Seattle, WA 98101"
  // "123 Main St, Unit 2B, Seattle, WA 98101"
  // "123 Main Street, Seattle, WA, 98101"
  
  const addressRegex = /^(.+?)(?:\s*,\s*(.+?))?(?:\s*,\s*([A-Z]{2}))(?:\s+(\d{5}(?:-\d{4})?))?$/i;
  const match = addressString.match(addressRegex);
  
  if (!match) {
    // If regex doesn't match, try simpler parsing
    const parts = addressString.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      return {
        address: parts[0],
        unit: null,
        city: parts[1] || '',
        state: parts[2]?.substring(0, 2).toUpperCase() || '',
        zipCode: parts[parts.length - 1]?.match(/\d{5}/)?.[0] || '',
        mlsNumber: null,
        squareFootage: null,
        bedrooms: null,
        bathrooms: null,
        foundationAccess: null,
        additionalUnits: null,
      };
    }
    
    // Fallback: just use the whole string as address
    return {
      address: addressString,
      unit: null,
      city: '',
      state: '',
      zipCode: '',
      mlsNumber: null,
      squareFootage: null,
      bedrooms: null,
      bathrooms: null,
      foundationAccess: null,
      additionalUnits: null,
    };
  }
  
  const [, streetAddress, city, state, zipCode] = match;
  
  // Check if street address contains unit info
  let address = streetAddress.trim();
  let unit: string | null = null;
  
  const unitMatch = address.match(/(.+?)\s*(?:unit|apt|apartment|#|suite)\s*([^\s,]+)/i);
  if (unitMatch) {
    address = unitMatch[1].trim();
    unit = unitMatch[2].trim();
  }
  
  return {
    address,
    unit,
    city: city || '',
    state: state?.toUpperCase() || '',
    zipCode: zipCode || '',
    mlsNumber: null,
    squareFootage: null,
    bedrooms: null,
    bathrooms: null,
    foundationAccess: null,
    additionalUnits: null,
  };
}

/**
 * Extract client information from calendar event attendees
 * Filters out the organizer (you) and identifies clients
 */
function extractClients(event: CalendarEvent, organizerEmail: string): ParsedClient[] {
  const clients: ParsedClient[] = [];
  
  if (!event.attendees || event.attendees.length === 0) {
    return clients;
  }
  
  for (const attendee of event.attendees) {
    // Skip organizer and resource attendees
    if (!attendee.email || attendee.email === organizerEmail) {
      continue;
    }
    
    // Skip if email is a calendar or system email
    if (attendee.email.includes('@google.com') || 
        attendee.email.includes('@calendar.google.com') ||
        attendee.email.includes('noreply')) {
      continue;
    }
    
    const displayName = attendee.displayName || attendee.email.split('@')[0];
    const { firstName, lastName } = parseName(displayName);
    
    // Extract phone from description if available
    const phone = extractPhone(event.description);
    
    clients.push({
      firstName: firstName || 'Unknown',
      lastName: lastName || 'Client',
      email: attendee.email,
      phone,
    });
  }
  
  return clients;
}

/**
 * Extract property information from calendar event
 * Checks location field first, then description, then title
 */
function extractProperty(event: CalendarEvent): ParsedProperty | null {
  // Priority: location > description > title
  const addressSource = event.location || event.description || event.summary || '';
  
  if (!addressSource) {
    return null;
  }
  
  // Try to parse address from location/description
  const property = parseAddress(addressSource);
  
  return property;
}

/**
 * Upsert a user (client) into the database
 * Uses email as unique identifier
 */
async function upsertUser(client: ParsedClient): Promise<string> {
  const [user, created] = await User.findOrCreate({
    where: { email: client.email },
    defaults: {
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
      userRole: 'client' as const,
      loginId: null,
    },
  });
  
  // Update if exists but data might have changed
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
 * Upsert a property into the database
 * Uses address + city + state as unique identifier
 */
async function upsertProperty(property: ParsedProperty): Promise<string> {
  const [dbProperty, created] = await Property.findOrCreate({
    where: {
      address: property.address,
      city: property.city,
      state: property.state,
    },
    defaults: property,
  });
  
  // Update if exists
  if (!created) {
    await dbProperty.update({
      unit: property.unit || dbProperty.unit,
      zipCode: property.zipCode || dbProperty.zipCode,
      mlsNumber: property.mlsNumber || dbProperty.mlsNumber,
    });
  }
  
  return dbProperty.id;
}

/**
 * Process and import calendar events into database
 * Accepts events array and processes them to extract clients and properties
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
    // Extract clients
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
    
    // Extract property
    const property = extractProperty(event);
    if (property) {
      const propertyKey = `${property.address}|${property.city}|${property.state}`;
      if (!processedProperties.has(propertyKey)) {
        const existingProperty = await Property.findOne({
          where: {
            address: property.address,
            city: property.city,
            state: property.state,
          },
        });
        
        await upsertProperty(property);
        
        if (existingProperty) {
          stats.propertiesUpdated++;
        } else {
          stats.propertiesImported++;
        }
        processedProperties.add(propertyKey);
      }
    }
  }
  
  return stats;
}

/**
 * Main import function
 * Can accept events from stdin (JSON) or be called programmatically
 */
async function importCalendarData(events?: CalendarEvent[]): Promise<void> {
  try {
    console.log('📅 Starting calendar data import...');
    
    // Connect to database
    await initializeDatabase();
    
    // Get organizer email (default to will@districthomepro.com)
    const organizerEmail = process.env.ORGANIZER_EMAIL || 'will@districthomepro.com';
    
    let eventsToProcess: CalendarEvent[] = [];
    
    // Check if events were passed as argument
    if (events && events.length > 0) {
      eventsToProcess = events;
      console.log(`📆 Processing ${eventsToProcess.length} calendar events...`);
    } else {
      // Check if stdin has data (for piping JSON from MCP tools)
      if (process.stdin.isTTY) {
        // No stdin input available
        console.log('⚠️  No events provided.');
        console.log('📖 Usage options:');
        console.log('  1. Pipe JSON events: echo \'[{"summary":"...","location":"..."}]\' | npm run import:calendar');
        console.log('  2. Use AI assistant with MCP to fetch and import events');
        console.log('  3. Call importCalendarData([events]) programmatically');
        return;
      } else {
        // Read from stdin
        const chunks: Buffer[] = [];
        for await (const chunk of process.stdin) {
          chunks.push(chunk);
        }
        const inputData = Buffer.concat(chunks).toString('utf-8');
        
        if (inputData.trim()) {
          try {
            eventsToProcess = JSON.parse(inputData);
            console.log(`📆 Processing ${eventsToProcess.length} calendar events from input...`);
          } catch (parseError) {
            console.error('❌ Failed to parse JSON input:', parseError);
            console.log('💡 Usage: echo \'[{"summary":"...","location":"..."}]\' | npm run import:calendar');
            throw parseError;
          }
        } else {
          console.log('⚠️  No events provided in stdin.');
          return;
        }
      }
    }
    
    if (eventsToProcess.length === 0) {
      console.log('⚠️  No events to process.');
      return;
    }
    
    // Process events
    const stats = await processEvents(eventsToProcess, organizerEmail);
    
    // Print summary
    console.log('\n📊 Import Summary:');
    console.log(`  ✅ Clients imported: ${stats.clientsImported}`);
    console.log(`  🔄 Clients updated: ${stats.clientsUpdated}`);
    console.log(`  ✅ Properties imported: ${stats.propertiesImported}`);
    console.log(`  🔄 Properties updated: ${stats.propertiesUpdated}`);
    console.log(`  📝 Total events processed: ${eventsToProcess.length}`);
    
    console.log('\n✅ Calendar import completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during calendar import:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Export for programmatic use
export { importCalendarData, extractClients, extractProperty, parseName, parseAddress };

// Only run if this file is executed directly (not imported)
// Check if this is the main module being executed
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('importCalendarData.js')) {
  // Parse command line arguments and run if called directly
  // Check if we have JSON input from stdin or --events flag
  const args = process.argv.slice(2);

  // If --events flag is provided, parse JSON from argument
  const eventsIndex = args.indexOf('--events');
  if (eventsIndex !== -1 && args[eventsIndex + 1]) {
    try {
      const events = JSON.parse(args[eventsIndex + 1]);
      importCalendarData(events)
        .then(() => {
          console.log('✅ Calendar import process completed.');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Calendar import failed:', error);
          process.exit(1);
        });
    } catch (error) {
      console.error('❌ Failed to parse --events JSON:', error);
      process.exit(1);
    }
  } else {
    // Otherwise, try to read from stdin or show usage
    importCalendarData()
      .then(() => {
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Calendar import failed:', error);
        process.exit(1);
      });
  }
}

