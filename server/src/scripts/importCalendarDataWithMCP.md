# Using MCP to Import Calendar Data

This guide explains how to use MCP Google Calendar tools to fetch events and import them into the database.

## Process Overview

1. **Fetch Calendar Events via MCP**: Use MCP Google Calendar tools to retrieve recent events
2. **Process Events**: Extract client and property information
3. **Import to Database**: Upsert clients and properties

## Step-by-Step Instructions for AI Assistant

### Step 1: Fetch Calendar Events

Use MCP Google Calendar tools to fetch events from the primary calendar:

```
Fetch calendar events from will@districthomepro.com for the last 30 days
```

The MCP tool should return an array of calendar events with:
- `summary` (event title)
- `location` (property address)
- `description` (may contain client info)
- `attendees` (array with client emails/names)
- `organizer` (your email)
- `start` and `end` (date/time)

### Step 2: Process and Import

Once events are fetched, use the import script:

```typescript
import { importCalendarData } from './scripts/importCalendarData.js';

// Events fetched from MCP
const events = [/* MCP calendar events */];

await importCalendarData(events);
```

Or via command line with JSON:

```bash
echo '[{"summary":"...","location":"...","attendees":[...]}]' | npm run import:calendar
```

### Step 3: Verify Import

Check the database to confirm clients and properties were imported:

```sql
SELECT * FROM users WHERE user_role = 'client' ORDER BY created_at DESC LIMIT 10;
SELECT * FROM properties ORDER BY created_at DESC LIMIT 10;
```

## Example MCP Tool Usage

When MCP Google Calendar is configured, you can use tools like:

- `list_calendar_events` - List events from a calendar
- `get_calendar_event` - Get details of a specific event
- `search_calendar_events` - Search events by criteria

Example query:
- Calendar: `primary` or `will@districthomepro.com`
- Time range: Last 30-60 days
- Include attendees: Yes
- Include location: Yes

## Troubleshooting

### MCP Tools Not Available

If MCP tools are not available:
1. Verify Google Calendar MCP is configured in Cursor settings
2. Check that OAuth authentication completed successfully
3. Restart Cursor after configuration changes

### No Events Found

- Check date range (events might be older than expected)
- Verify calendar ID is correct
- Ensure events have attendees and locations

### Import Errors

- Check database connection
- Verify User and Property models are initialized
- Check for duplicate email addresses or addresses



