/**
WHY: Reduces main script file size, isolates pa...
 */
import { createLogger } from '../../utils/logger.js'
import { ATTENDEE_ROLE_CLIENT } from '../../constants/userRoles.js'
import type { ContactInfoBase } from '@shared/types/contactTypes'
import type { PropertyAddressBase, PropertyDetailsBase } from '@shared/types/propertyTypes'

const logger = createLogger('calendarParsingHelpers')

function withDefault(value: string | null | undefined, defaultVal: string, context: string): string {
  if (value === null || value === undefined) {
    logger.warn('Calendar parse: missing value, using default', { context, defaultVal })
    return defaultVal
  }
  return value
}

const DEFAULT_FIRST_NAME = 'Unknown' as const
const DEFAULT_LAST_NAME = ATTENDEE_ROLE_CLIENT

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

export interface ParsedClient extends ContactInfoBase {
  phone: string | null;
}

export interface ParsedProperty extends PropertyAddressBase, PropertyDetailsBase {
  unit: string | null;
  mlsNumber: string | null;
  squareFootage: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  foundationAccess: 'basement' | 'crawlspace' | 'slab' | null;
  additionalUnits: number | null;
}

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

export function parseName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map(p => p.trim())
    if (parts.length >= 2) {
      const firstPart = parts[1].split(' ')[0]
      return {
        lastName: parts[0],
        firstName: firstPart !== undefined && firstPart !== '' ? firstPart : parts[1],
      }
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

export function parseAddress(addressString: string): ParsedProperty | null {
  if (!addressString || addressString.trim().length === 0) {
    return null;
  }
  
  const addressRegex = /^(.+?)(?:\s*,\s*(.+?))?(?:\s*,\s*([A-Z]{2}))(?:\s+(\d{5}(?:-\d{4})?))?$/i;
  const match = addressString.match(addressRegex);
  
  if (!match) {
    const parts = addressString.split(',').map(p => p.trim())
    if (parts.length >= 2) {
      const property = createEmptyProperty(parts[0])
      property.city = withDefault(parts[1], '', 'parseAddress.fallback.city')
      property.state = withDefault(parts[2]?.substring(0, 2).toUpperCase(), '', 'parseAddress.fallback.state')
      property.zipCode = withDefault(parts[parts.length - 1]?.match(/\d{5}/)?.[0], '', 'parseAddress.fallback.zipCode')
      return property
    }
    return createEmptyProperty(addressString)
  }

  const [, streetAddress, city, state, zipCode] = match
  const safeStreet = withDefault(streetAddress, addressString.trim(), 'parseAddress.streetAddress')
  const { address, unit } = extractUnitFromAddress(safeStreet)
  const property = createEmptyProperty(address)
  property.unit = unit
  property.city = withDefault(city, '', 'parseAddress.city')
  property.state = withDefault(state?.toUpperCase(), '', 'parseAddress.state')
  property.zipCode = withDefault(zipCode, '', 'parseAddress.zipCode')
  return property
}

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
    
    let displayName: string
    if (attendee.displayName !== undefined && attendee.displayName !== '') {
      displayName = attendee.displayName
    } else {
      logger.warn('Calendar parse: missing displayName, using email local part', { email: attendee.email })
      displayName = attendee.email.split('@')[0]
    }
    const { firstName, lastName } = parseName(displayName)
    const phone = extractPhone(event.description)
    let finalFirstName = firstName
    if (finalFirstName === '') {
      logger.warn('Calendar parse: empty firstName, using default', { email: attendee.email })
      finalFirstName = DEFAULT_FIRST_NAME
    }
    const finalLastName = lastName !== '' ? lastName : DEFAULT_LAST_NAME
    clients.push({
      firstName: finalFirstName,
      lastName: finalLastName,
      email: attendee.email,
      phone,
    })
  }
  
  return clients;
}

export function extractProperty(event: CalendarEvent): ParsedProperty | null {
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
