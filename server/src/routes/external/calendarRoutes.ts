// import { Router } from 'express';
// import { google } from 'googleapis';
// import dotenv from "dotenv";
// import { calendarOAuth } from '../../config/connection.js'

// dotenv.config();

// const router = Router();

// // Initialize OAuth2 client


// // Google Calendar API client
// const calendar = google.calendar({ version: 'v3', auth: calendarOAuth });

// // Route to get calendar events
// router.get('/events', async (_req, res) => {
//   try {
//     const response = await calendar.events.list({
//       calendarId: 'primary', // Use 'primary' for the user's main calendar
//       timeMin: (new Date()).toISOString(), // Filter events that start from now
//       maxResults: 10, // Limit the number of events
//       singleEvents: true, // Expand recurring events into individual occurrences
//       orderBy: 'startTime', // Sort events by start time
//     });

//     // Send the list of events back to the client
//     res.json(response.data.items);
//   } catch (error) {
//     console.error('Error fetching calendar events', error);
//     res.status(500).send('Error fetching events');
//   }
// });

// export { router as CalendarRouter };
