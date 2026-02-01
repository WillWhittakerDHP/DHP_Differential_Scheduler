
import { importCalendarData } from './importCalendarData.js';

const sampleEvents = [
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
  }
];

function extractClientNameFromSummary(summary: string): string | null {
  const patterns = [
    /for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /Buyer's Inspection for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /Walk & Talk for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
    /Formal Presentation for\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/,
  ];
  
  for (const pattern of patterns) {
    const match = summary.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

function convertMCPEventsToCalendarEvents(mcpEvents: any[]): any[] {
  return mcpEvents.map(event => {
    const clientName = extractClientNameFromSummary(event.summary || '');
    
    const attendees = [];
    if (event.attendees) {
      for (const attendee of event.attendees) {
        if (attendee.email && attendee.email !== 'will@districthomepro.com') {
          attendees.push({
            email: attendee.email,
            displayName: attendee.displayName || clientName || attendee.email.split('@')[0],
            responseStatus: attendee.responseStatus || 'needsAction'
          });
        }
      }
    }
    
    if (attendees.length === 0 && clientName) {
      const email = `${clientName.toLowerCase().replace(/\s+/g, '.')}@client.example.com`;
      attendees.push({
        email: email,
        displayName: clientName,
        responseStatus: 'needsAction'
      });
    }
    
    return {
      summary: event.summary,
      location: event.location,
      description: event.description,
      start: event.start ? { dateTime: event.start.dateTime || event.start.date } : undefined,
      end: event.end ? { dateTime: event.end.dateTime || event.end.date } : undefined,
      attendees: attendees,
      organizer: { email: 'will@districthomepro.com', displayName: 'Will' }
    };
  });
}

async function main() {
  try {
    console.log('📅 Processing calendar events for import...');
    
    const convertedEvents = convertMCPEventsToCalendarEvents(sampleEvents);
    
    console.log(`📊 Converted ${convertedEvents.length} events for import`);
    
    await importCalendarData(convertedEvents);
    
    console.log('✅ Import completed successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

main();

