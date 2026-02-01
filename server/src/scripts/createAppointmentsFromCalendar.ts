
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Appointment, PropertyVersion, Address, User, AppointmentAttendee, sequelize, initializeDatabase } from '../config/app.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env.development');
dotenv.config({ path: envPath });

if (!process.env.DB_HOST) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

interface CalendarEvent {
  summary?: string;
  location?: string;
  description?: string;
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

function extractAgentNameFromSummary(summary: string | undefined): string | null {
  if (!summary) return null;
  
  const patterns = [
    /for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)?)/,
    /Buyer's Inspection for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)?)/,
    /Walk & Talk for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)?)/,
    /Formal Presentation for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)?)/,
  ];
  
  for (const pattern of patterns) {
    const match = summary.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

function getRandomElement<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

function parseAddressForMatching(addressString: string | undefined): { address: string; city: string; state: string } | null {
  if (!addressString) return null;
  
  const cleaned = addressString.replace(/,?\s*USA\s*$/i, '').trim();
  
  // Pattern: "123 Main St, City, ST" or "123 Main St, City, ST 12345"
  const parts = cleaned.split(',').map(p => p.trim());
  
  if (parts.length >= 2) {
    const address = parts[0];
    const city = parts[1] || '';
    const lastPart = parts[parts.length - 1] || '';
    const stateMatch = lastPart.match(/\b([A-Z]{2})\b/);
    const state = stateMatch ? stateMatch[1] : '';
    
    if (address && city && state) {
      return { address, city, state };
    }
  }
  
  if (parts.length > 0) {
    return {
      address: parts[0],
      city: '',
      state: '',
    };
  }
  
  return null;
}

async function findUserByNameOrEmail(name: string | null, email: string | null): Promise<string | null> {
  if (email) {
    const user = await User.findOne({ where: { email } });
    if (user) return user.id;
  }
  
  if (name) {
    const nameParts = name.split(/\s+/);
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      const user = await User.findOne({
        where: {
          firstName: firstName,
          lastName: lastName,
        },
      });
      
      if (user) return user.id;
    }
  }
  
  return null;
}

async function findPropertyByAddress(location: string | undefined): Promise<string | null> {
  if (!location) return null;
  
  const addressParts = parseAddressForMatching(location);
  if (!addressParts) return null;
  
  if (addressParts.city && addressParts.state) {
    const address = await Address.findOne({
      where: {
        address: addressParts.address,
        city: addressParts.city,
        state: addressParts.state,
      },
      include: [
        { model: PropertyVersion, as: 'propertyVersions', required: false },
      ],
    });
    
    // PATTERN: Use 'as any' cast to access Sequelize associations
    const addressWithAssociations = address as any;
    if (addressWithAssociations && addressWithAssociations.propertyVersions && addressWithAssociations.propertyVersions.length > 0) {
      return addressWithAssociations.propertyVersions[0].id;
    }
  }
  
  const address = await Address.findOne({
    where: {
      address: addressParts.address,
    },
    include: [
      { model: PropertyVersion, as: 'propertyVersions', required: false },
    ],
  });
  
  // PATTERN: Use 'as any' cast to access Sequelize associations
  const addressWithAssociations = address as any;
  if (addressWithAssociations && addressWithAssociations.propertyVersions && addressWithAssociations.propertyVersions.length > 0) {
    return addressWithAssociations.propertyVersions[0].id;
  }
  
  return null;
}

/**
 * Parse date/time from calendar event
 * LEARNING: Uses new format with startTime/endTime (RFC3339) directly from Google Calendar API
 * WHY: Google Calendar API returns RFC3339 format, matches our new SelectedTimeSlot format
 */
function parseEventDateTime(event: CalendarEvent): { selectedDate: Date | null; selectedTimeSlots: Array<{ startTime: string; endTime: string }> | null } {
  const start = event.start?.dateTime || event.start?.date;
  const end = event.end?.dateTime || event.end?.date;
  
  if (!start) return { selectedDate: null, selectedTimeSlots: null };
  
  const startDate = new Date(start);
  const selectedDate = startDate;
  
  // LEARNING: Google Calendar API already provides RFC3339 format, use directly
  let selectedTimeSlots: Array<{ startTime: string; endTime: string }> | null = null;
  
  if (event.start?.dateTime && event.end?.dateTime) {
    selectedTimeSlots = [{
      startTime: event.start.dateTime,  // Already RFC3339 from Google Calendar
      endTime: event.end.dateTime,       // Already RFC3339 from Google Calendar
    }];
  }
  
  return { selectedDate, selectedTimeSlots };
}

function determineStatus(summary: string | undefined): 'started' | 'held' | 'rescheduling' | 'quoted' | 'submitted' | 'confirmed' | 'cancelled' | 'deleted' {
  if (!summary) return 'started';
  
  const lowerSummary = summary.toLowerCase();
  
  if (lowerSummary.includes('completed') || lowerSummary.includes('finished')) {
    return 'confirmed';
  }
  
  if (lowerSummary.includes('cancelled') || lowerSummary.includes('canceled')) {
    return 'cancelled';
  }
  
  if (lowerSummary.includes('quote') || lowerSummary.includes('estimate')) {
    return 'quoted';
  }
  
  return 'confirmed';
}

async function createAppointmentsFromEvents(events: CalendarEvent[]): Promise<{
  created: number;
  skipped: number;
  errors: number;
}> {
  const stats = { created: 0, skipped: 0, errors: 0 };
  const organizerEmail = 'will@districthomepro.com';
  
  const allUsers = await User.findAll();
  
  for (const event of events) {
    try {
      if (!event.location) {
        console.log(`⏭️  Skipping "${event.summary}" - no location`);
        stats.skipped++;
        continue;
      }
      
      const propertyVersionId = await findPropertyByAddress(event.location);
      if (!propertyVersionId) {
        console.log(`⏭️  Skipping "${event.summary}" - property not found: ${event.location}`);
        stats.skipped++;
        continue;
      }
      
      let agentId: string | null = null;
      
      if (event.attendees && event.attendees.length > 0) {
        for (const attendee of event.attendees) {
          if (attendee.email && attendee.email !== organizerEmail) {
            const foundUserId = await findUserByNameOrEmail(null, attendee.email);
            if (foundUserId) {
              const user = await User.findByPk(foundUserId);
              if (user && user.userRole === 'agent') {
                agentId = foundUserId;
                break;
              }
            }
          }
        }
      }
      
      if (!agentId) {
        const agentName = extractAgentNameFromSummary(event.summary);
        if (agentName) {
          agentId = await findUserByNameOrEmail(agentName, null);
        }
      }
      
      const { selectedDate, selectedTimeSlots } = parseEventDateTime(event);
      
      const status = determineStatus(event.summary);
      
      const randomScheduler = getRandomElement(allUsers);
      const scheduledById = randomScheduler?.id || null;
      
      if (selectedDate) {
        const existing = await Appointment.findOne({
          where: {
            propertyVersionId,
            selectedDate: selectedDate.toISOString().split('T')[0],
          },
        });
        
        if (existing) {
          console.log(`⏭️  Skipping "${event.summary}" - appointment already exists`);
          stats.skipped++;
          continue;
        }
      }
      
      const appointment = await Appointment.create({
        propertyVersionId,
        userTypeId: null, // Would need to determine from event
        selectedServiceIds: null, // Would need to determine from event
        selectedPropertyIds: null, // Would need to determine from event
        selectedOptionIds: null,
        selectedDate: selectedDate || null,
        selectedDateRangeEnd: null,
        selectedTimeSlots,
        isQuoteMode: status === 'quoted',
        quotePdfUrl: null,
        status,
        scheduledById, // Randomly assigned for testing
        propertyDetails: null,
      });
      
      // Create attendee record for agent if found
      if (agentId) {
        await AppointmentAttendee.create({
          appointmentId: appointment.id,
          userId: agentId,
          userTypeBlockInstanceId: null, // Would need to look up Agent UserTypeBlock
          shouldReceiveInvitation: true,
          invitationStatus: 'pending',
        });
      }
      
      console.log(`✅ Created appointment: "${event.summary}" (agent: ${agentId ? 'found' : 'none'}, scheduledBy: ${scheduledById ? 'assigned' : 'none'})`);
      stats.created++;
      
    } catch (error) {
      console.error(`❌ Error creating appointment for "${event.summary}":`, error);
      stats.errors++;
    }
  }
  
  return stats;
}

async function main() {
  try {
    console.log('📅 Creating appointments from Google Calendar events...');
    
    await initializeDatabase();
    
    const calendarEvents: CalendarEvent[] = [
      {
        summary: "Buyer's Inspection for Todd Litchfield",
        location: "3439 Woodburn Rd, Annandale, VA 22003",
        start: { dateTime: "2024-12-02T11:45:00-05:00" },
        end: { dateTime: "2024-12-02T13:30:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Tom Miller",
        location: "730 24th St NW 803, Washington, DC 20037",
        start: { dateTime: "2024-12-04T09:00:00-05:00" },
        end: { dateTime: "2024-12-04T10:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Home Inspection Results Meeting for Royi & Lucciola",
        location: "4921 Chevy Chase Blvd, Chevy Chase, MD 20815, USA",
        start: { dateTime: "2024-12-06T14:30:00-05:00" },
        end: { dateTime: "2024-12-06T16:00:00-05:00" },
        attendees: [
          { email: "luchernaga@hotmail.com", displayName: "Lucciola", responseStatus: "accepted" },
          { email: "edgardorsuarez@gmail.com", displayName: "Eddie Suarez", responseStatus: "accepted" },
          { email: "rgavish@yahoo.com", displayName: "Royi", responseStatus: "needsAction" },
          { email: "jenn@alwaysbethriving.com", displayName: "Jenn", responseStatus: "needsAction" },
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Eddie Suarez",
        location: "4921 Chevy Chase Blvd, Chevy Chase, MD 20815",
        start: { dateTime: "2024-12-06T10:00:00-05:00" },
        end: { dateTime: "2024-12-06T14:30:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Thomas Snow",
        location: "2815 Laurel Ave, Hyattsville, MD 20785",
        start: { dateTime: "2024-12-09T08:30:00-05:00" },
        end: { dateTime: "2024-12-09T11:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for David Park",
        location: "1013 17th Pl NE 6, Washington, DC 20002",
        start: { dateTime: "2024-12-18T11:00:00-05:00" },
        end: { dateTime: "2024-12-18T13:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Jen Angotti",
        location: "3925 Fulton St NW 4, Washington, DC 20007",
        start: { dateTime: "2024-12-18T15:00:00-05:00" },
        end: { dateTime: "2024-12-18T17:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Walk & Talk for Tom Miller",
        location: "601 Sugarland Run Dr, Sterling, VA 20164",
        start: { dateTime: "2024-12-19T13:45:00-05:00" },
        end: { dateTime: "2024-12-19T16:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Monique Van Blaricom",
        location: "3601 Connecticut Ave NW, Washington, DC 20008",
        start: { dateTime: "2024-12-20T08:00:00-05:00" },
        end: { dateTime: "2024-12-20T09:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Tom Miller",
        location: "1304 F St NE 2, Washington, DC 20002",
        start: { dateTime: "2024-12-20T11:30:00-05:00" },
        end: { dateTime: "2024-12-20T13:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Ryan Tyndall",
        location: "2325 42nd St NW 412, Washington, DC 20007",
        start: { dateTime: "2024-12-21T09:00:00-05:00" },
        end: { dateTime: "2024-12-21T11:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Emma MacEachern",
        location: "1867 Park Rd NW 3, Washington, DC 20010",
        start: { dateTime: "2024-12-21T15:30:00-05:00" },
        end: { dateTime: "2024-12-21T17:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Ryan Tyndall",
        location: "1500 17th St NW 1, Washington, DC 20036",
        start: { dateTime: "2024-12-22T09:00:00-05:00" },
        end: { dateTime: "2024-12-22T12:15:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Tom Miller",
        location: "20751 Heron Landing Dr, Sterling, VA 20166",
        start: { dateTime: "2024-12-23T09:30:00-05:00" },
        end: { dateTime: "2024-12-23T15:45:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Walk & Talk for Ryan Tyndall",
        location: "5210 Saratoga Ave, Chevy Chase, MD 20815",
        start: { dateTime: "2024-12-26T14:00:00-05:00" },
        end: { dateTime: "2024-12-26T15:30:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Ryan Tyndall",
        location: "647 G St SE 4, Washington, DC 20003",
        start: { dateTime: "2024-12-29T10:00:00-05:00" },
        end: { dateTime: "2024-12-29T13:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Fernando Garcia",
        location: "2145 California St NW 103, Washington, DC 20008",
        start: { dateTime: "2025-01-02T12:30:00-05:00" },
        end: { dateTime: "2025-01-02T13:30:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Leslie Brenowitz",
        location: "1006 Florida Ave NE 402, Washington, DC 20002",
        start: { dateTime: "2025-01-04T12:00:00-05:00" },
        end: { dateTime: "2025-01-04T14:30:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for George Lima",
        location: "1002 9th St NE, Washington, DC 20002",
        start: { dateTime: "2025-01-05T09:00:00-05:00" },
        end: { dateTime: "2025-01-05T10:30:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Walk & Talk for Jason Townsend",
        location: "2506 S Arlington Mill Dr E-5, Arlington, VA 22206",
        start: { dateTime: "2025-01-05T14:30:00-05:00" },
        end: { dateTime: "2025-01-05T16:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Walk & Talk for Todd Litchfield",
        location: "8319 Carnegie Dr, Vienna, VA 22180",
        start: { dateTime: "2025-01-16T12:30:00-05:00" },
        end: { dateTime: "2025-01-16T14:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Nezam Hamiki",
        location: "730 24th St NW 406, Washington, DC 20037",
        start: { dateTime: "2025-01-16T15:30:00-05:00" },
        end: { dateTime: "2025-01-16T16:30:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Walk & Talk for Renee Peres",
        location: "2001 12th St NW 412, Washington, DC 20009",
        start: { dateTime: "2025-01-17T16:00:00-05:00" },
        end: { dateTime: "2025-01-17T17:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Walk & Talk for Jill Judge",
        location: "4388 Queens Chapel Terrace NE, Washington, DC 20018",
        start: { dateTime: "2025-01-18T12:00:00-05:00" },
        end: { dateTime: "2025-01-18T13:30:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for John Murray",
        location: "2020 12th St NW 214, Washington, DC 20009",
        start: { dateTime: "2025-01-20T14:30:00-05:00" },
        end: { dateTime: "2025-01-20T16:30:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Tom Miller",
        location: "1744 U St NW G, Washington, DC 20009",
        start: { dateTime: "2025-01-21T10:00:00-05:00" },
        end: { dateTime: "2025-01-21T11:15:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Alex Fox",
        location: "400 massachusetts ave  720, washington , dc 20001",
        start: { dateTime: "2025-01-22T10:00:00-05:00" },
        end: { dateTime: "2025-01-22T12:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Walk & Talk for Ryan Tyndall",
        location: "4522 Garrison St NW, Washington, DC 20016",
        start: { dateTime: "2025-01-26T09:30:00-05:00" },
        end: { dateTime: "2025-01-26T11:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Alison Scimeca",
        location: "1705 Euclid St NW 1, Washington, DC 20009",
        start: { dateTime: "2025-01-26T12:00:00-05:00" },
        end: { dateTime: "2025-01-26T13:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Walk & Talk for Jason Townsend",
        location: "4201 Cathedral Ave NW 602W, Washington, DC 20016",
        start: { dateTime: "2025-01-27T16:00:00-05:00" },
        end: { dateTime: "2025-01-27T17:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
      {
        summary: "Buyer's Inspection for Jay Fazio",
        location: "6514 Western Ave, Chevy Chase, MD 20815",
        start: { dateTime: "2025-01-29T08:30:00-05:00" },
        end: { dateTime: "2025-01-29T13:00:00-05:00" },
        attendees: [
          { email: "will@districthomepro.com", displayName: "Will", responseStatus: "accepted" }
        ],
        organizer: { email: "will@districthomepro.com", displayName: "Will" }
      },
    ];
    
    console.log(`📊 Processing ${calendarEvents.length} calendar events...\n`);
    
    const stats = await createAppointmentsFromEvents(calendarEvents);
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${stats.created}`);
    console.log(`   ⏭️  Skipped: ${stats.skipped}`);
    console.log(`   ❌ Errors: ${stats.errors}`);
    console.log('\n✅ Appointment creation completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

