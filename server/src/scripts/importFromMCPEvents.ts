/**
 * Import Calendar Events from MCP
 * 
 * This script processes calendar events fetched via MCP and imports them
 * into the database using the importCalendarData function.
 */

import { importCalendarData } from './importCalendarData.js';

// Sample events structure based on MCP output
// We'll need to convert MCP event format to CalendarEvent format
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

// Extract client names from event summaries
function extractClientNameFromSummary(summary: string): string | null {
  // Patterns like "Buyer's Inspection for [Name]" or "for [Name]"
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

// Convert MCP event format to CalendarEvent format
function convertMCPEventsToCalendarEvents(mcpEvents: any[]): any[] {
  return mcpEvents.map(event => {
    // Extract client name from summary if no attendees
    const clientName = extractClientNameFromSummary(event.summary || '');
    
    // Build attendees list - exclude organizer
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
    
    // If no attendees but we have a client name, create a placeholder
    if (attendees.length === 0 && clientName) {
      // Create a placeholder email from the name
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

// Main execution
async function main() {
  try {
    console.log('📅 Processing calendar events for import...');
    
    // For now, using sample events - in production, these would come from MCP
    const convertedEvents = convertMCPEventsToCalendarEvents(sampleEvents);
    
    console.log(`📊 Converted ${convertedEvents.length} events for import`);
    
    // Import the events
    await importCalendarData(convertedEvents);
    
    console.log('✅ Import completed successfully!');
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

main();

