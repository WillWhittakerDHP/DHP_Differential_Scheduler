/**
 * Calendar Parsing Helpers
 * 
 * LEARNING: Pure parsing functions extracted from importCalendarData.ts for better testability and cohesion
 * WHY: Reduces main script file size, isolates parsing logic, enables independent testing
 * PATTERN: Pure functions with no side effects, focused on data transformation
 */

/**
 * Default values for client name parsing
 * LEARNING: Named constants replace magic strings
 * WHY: Eliminates hardcoding audit findings, provides single source of truth
 */
const DEFAULT_FIRST_NAME = 'Unknown' as const
const DEFAULT_LAST_NAME = 'Client' as const

/**
 * Calendar Event interface
 * LEARNING: Google Calendar API event structure
 * WHY: Type safety for calendar event parsing
 */
export interface CalendarEvent {
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

/**
 * Parsed client data structure
 * LEARNING: Normalized client information extracted from calendar events
 * WHY: Type safety for client data processing
 */
export interface ParsedClient {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

/**
 * Parsed property data structure
 * LEARNING: Normalized property information extracted from calendar events
 * WHY: Type safety for property data processing
 */
export interface ParsedProperty {
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
 * Create empty property structure with default values
 * LEARNING: Helper to eliminate duplication of null-field pattern
 * WHY: Reduces parseAddress complexity, addresses deprecation patterns
 * PATTERN: Explicit empty strings instead of `|| ''` fallbacks
 * 
 * @param address - Street address (required)
 * @returns ParsedProperty with all optional fields set to null/empty
 */
function createEmptyProperty(address: string): ParsedProperty {
  return {
    address,
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

/**
 * Extract unit number from address string
 * LEARNING: Helper to extract unit/apartment/suite information
 * WHY: Reduces parseAddress complexity and nesting
 * 
 * @param address - Street address string
 * @returns Object with extracted address and unit, or original address with null unit
 */
function extractUnitFromAddress(address: string): { address: string; unit: string | null } {
  const unitMatch = address.match(/(.+?)\s*(?:unit|apt|apartment|#|suite)\s*([^\s,]+)/i);
  if (unitMatch) {
    return {
      address: unitMatch[1].trim(),
      unit: unitMatch[2].trim(),
    };
  }
  return {
    address: address.trim(),
    unit: null,
  };
}

/**
 * Parse full name into first and last name
 * LEARNING: Handles comma-separated (Last, First) and space-separated formats
 * WHY: Normalizes name parsing for client extraction
 * 
 * @param fullName - Full name string (may be "Last, First" or "First Last")
 * @returns Object with firstName and lastName
 */
export function parseName(fullName: string): { firstName: string; lastName: string } {
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

/**
 * Extract phone number from text
 * LEARNING: Regex-based phone extraction with formatting
 * WHY: Extracts phone numbers from calendar event descriptions
 * 
 * @param text - Text that may contain a phone number
 * @returns Formatted phone number (XXX-XXX-XXXX) or null
 */
function extractPhone(text: string | undefined): string | null {
  if (!text) return null;
  
  const phoneRegex = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/;
  const match = text.match(phoneRegex);
  return match ? match[1].replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') : null;
}

/**
 * Parse address string into structured property data
 * LEARNING: Handles multiple address formats with regex and fallback parsing
 * WHY: Extracts property information from calendar event location/description
 * PATTERN: Uses createEmptyProperty and extractUnitFromAddress helpers to reduce complexity
 * 
 * @param addressString - Address string from calendar event
 * @returns ParsedProperty or null if address is invalid/empty
 */
export function parseAddress(addressString: string): ParsedProperty | null {
  if (!addressString || addressString.trim().length === 0) {
    return null;
  }
  
  const addressRegex = /^(.+?)(?:\s*,\s*(.+?))?(?:\s*,\s*([A-Z]{2}))(?:\s+(\d{5}(?:-\d{4})?))?$/i;
  const match = addressString.match(addressRegex);
  
  if (!match) {
    // Fallback: try comma-separated parsing
    const parts = addressString.split(',').map(p => p.trim());
    if (parts.length >= 2) {
      const property = createEmptyProperty(parts[0]);
      property.city = parts[1] ?? '';
      property.state = parts[2]?.substring(0, 2).toUpperCase() ?? '';
      property.zipCode = parts[parts.length - 1]?.match(/\d{5}/)?.[0] ?? '';
      return property;
    }
    
    // Last resort: return address-only property
    return createEmptyProperty(addressString);
  }
  
  const [, streetAddress, city, state, zipCode] = match;
  
  const { address, unit } = extractUnitFromAddress(streetAddress);
  
  const property = createEmptyProperty(address);
  property.unit = unit;
  property.city = city ?? '';
  property.state = state?.toUpperCase() ?? '';
  property.zipCode = zipCode ?? '';
  
  return property;
}

/**
 * Extract clients from calendar event attendees
 * LEARNING: Filters out organizer and system emails, parses names and phone numbers
 * WHY: Extracts client information from calendar event attendees
 * 
 * @param event - Calendar event with attendees
 * @param organizerEmail - Email of the event organizer (to exclude)
 * @returns Array of parsed client data
 */
export function extractClients(event: CalendarEvent, organizerEmail: string): ParsedClient[] {
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
      firstName: firstName || DEFAULT_FIRST_NAME,
      lastName: lastName || DEFAULT_LAST_NAME,
      email: attendee.email,
      phone,
    });
  }
  
  return clients;
}

/**
 * Extract property from calendar event
 * LEARNING: Tries location, description, then summary as address sources
 * WHY: Extracts property information from calendar event fields
 * PATTERN: Uses explicit empty string fallback instead of `|| ''` chain
 * 
 * @param event - Calendar event with location/description/summary
 * @returns ParsedProperty or null if no address found
 */
export function extractProperty(event: CalendarEvent): ParsedProperty | null {
  // LEARNING: Explicit fallback chain instead of `|| ''` pattern
  // WHY: Addresses deprecation audit finding for unhelpful-default-or
  const addressSource = event.location 
    ? event.location 
    : event.description 
      ? event.description 
      : event.summary 
        ? event.summary 
        : '';
  
  if (!addressSource) {
    return null;
  }
  
  return parseAddress(addressSource);
}
