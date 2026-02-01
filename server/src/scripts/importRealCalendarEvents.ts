
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env.development');
dotenv.config({ path: envPath });

if (!process.env.DB_HOST) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

import { importCalendarData } from './importCalendarData.js';

const realEvents = [
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
  }
];

function enhanceEventsWithClientNames(events: any[]): any[] {
  return events.map(event => {
    const clientNameMatch = event.summary?.match(/for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)?)/);
    const clientName = clientNameMatch ? clientNameMatch[1] : null;
    
    const hasRealAttendees = event.attendees?.some((a: any) => 
      a.email && !a.email.includes('districthomepro.com')
    );
    
    if (clientName && !hasRealAttendees) {
      const email = `${clientName.toLowerCase().replace(/\s+/g, '.')}@client.placeholder`;
      return {
        ...event,
        attendees: [
          ...(event.attendees || []),
          {
            email: email,
            displayName: clientName,
            responseStatus: 'needsAction'
          }
        ]
      };
    }
    
    return event;
  });
}

async function main() {
  try {
    console.log('📅 Processing real calendar events for import...');
    
    const enhancedEvents = enhanceEventsWithClientNames(realEvents);
    console.log(`📊 Processing ${enhancedEvents.length} events`);
    
    await importCalendarData(enhancedEvents);
    
    console.log('✅ Import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

main();

