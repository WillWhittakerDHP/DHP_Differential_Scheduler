
import 'dotenv/config';
import { Address, PropertyVersion, PropertyDetails, User, sequelize, initializeDatabase } from '../config/app.js';

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

function parseName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      return {
        lastName: parts[0],
        firstName: parts[1].split(' ')[0] || parts[1],
      };
    }
  }
  
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function extractPhone(text: string | undefined): string | null {
  if (!text) return null;
  
  const phoneRegex = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/;
  const match = text.match(phoneRegex);
  return match ? match[1].replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') : null;
}

function parseAddress(addressString: string): ParsedProperty | null {
  if (!addressString || addressString.trim().length === 0) {
    return null;
  }
  
  
  const addressRegex = /^(.+?)(?:\s*,\s*(.+?))?(?:\s*,\s*([A-Z]{2}))(?:\s+(\d{5}(?:-\d{4})?))?$/i;
  const match = addressString.match(addressRegex);
  
  if (!match) {
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

function extractClients(event: CalendarEvent, organizerEmail: string): ParsedClient[] {
  const clients: ParsedClient[] = [];
  
  if (!event.attendees || event.attendees.length === 0) {
    return clients;
  }
  
  for (const attendee of event.attendees) {
    if (!attendee.email || attendee.email === organizerEmail) {
      continue;
    }
    
    if (attendee.email.includes('@google.com') || 
        attendee.email.includes('@calendar.google.com') ||
        attendee.email.includes('noreply')) {
      continue;
    }
    
    const displayName = attendee.displayName || attendee.email.split('@')[0];
    const { firstName, lastName } = parseName(displayName);
    
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

function extractProperty(event: CalendarEvent): ParsedProperty | null {
  const addressSource = event.location || event.description || event.summary || '';
  
  if (!addressSource) {
    return null;
  }
  
  const property = parseAddress(addressSource);
  
  return property;
}

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
        source: 'client' as const, // Calendar imports are from client input
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

      if (Object.keys(updates).length > 0) {
        await propertyDetails.update(updates, { transaction });
      }
    }

    return propertyVersion.id;
  });
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
    
    const property = extractProperty(event);
    if (property) {
      const propertyKey = `${property.address}|${property.city}|${property.state}`;
      if (!processedProperties.has(propertyKey)) {
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
        
        const existingPropertyVersion = existingAddress && (existingAddress as any).propertyVersions?.[0];
        
        await upsertProperty(property);
        
        if (existingPropertyVersion) {
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

async function importCalendarData(events?: CalendarEvent[]): Promise<void> {
  try {
    console.log('📅 Starting calendar data import...');
    
    await initializeDatabase();
    
    const organizerEmail = process.env.ORGANIZER_EMAIL || 'will@districthomepro.com';
    
    let eventsToProcess: CalendarEvent[] = [];
    
    if (events && events.length > 0) {
      eventsToProcess = events;
      console.log(`📆 Processing ${eventsToProcess.length} calendar events...`);
    } else {
      if (process.stdin.isTTY) {
        console.log('⚠️  No events provided.');
        console.log('📖 Usage options:');
        console.log('  1. Pipe JSON events: echo \'[{"summary":"...","location":"..."}]\' | npm run import:calendar');
        console.log('  2. Use AI assistant with MCP to fetch and import events');
        console.log('  3. Call importCalendarData([events]) programmatically');
        return;
      } else {
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
    
    const stats = await processEvents(eventsToProcess, organizerEmail);
    
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

export { importCalendarData, extractClients, extractProperty, parseName, parseAddress };

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('importCalendarData.js')) {
  const args = process.argv.slice(2);

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

