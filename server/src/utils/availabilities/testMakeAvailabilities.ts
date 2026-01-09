// import { makeAvailabilities } from "./makeAvailabilties";

// export const freeBusyResponse = {
//   calendars: {
//     calendar1: {
//       busy: [
//         // Day 1: Tomorrow
//         {
//           start: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().replace(/T.+/, 'T12:00:00-05:00'),
//           end: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().replace(/T.+/, 'T14:15:00-05:00'),
//         },
//         // Day 2
//         {
//           start: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().replace(/T.+/, 'T10:15:00-05:00'),
//           end: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().replace(/T.+/, 'T11:00:00-05:00'),
//         },
//         {
//           start: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().replace(/T.+/, 'T15:45:00-05:00'),
//           end: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().replace(/T.+/, 'T16:30:00-05:00'),
//         },
//         // Day 3
//         {
//           start: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().replace(/T.+/, 'T07:30:00-05:00'),
//           end: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().replace(/T.+/, 'T12:30:00-05:00'),
//         },
//         // Day 4: No busy times
//         // Day 5
//         {
//           start: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().replace(/T.+/, 'T16:45:00-05:00'),
//           end: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().replace(/T.+/, 'T22:00:00-05:00'),
//         },
//       ],
//     },
//   },
// };


// const adminSettings = {
//   leadTime: 15, // Lead time in minutes
//   freeHours: {
//     // Define free hours for each day (0 = Sunday, 6 = Saturday)
//     0: { start: "08:00", end: "20:00" },
//     1: { start: "08:00", end: "20:00" },
//     2: { start: "08:00", end: "20:00" },
//     3: { start: "08:00", end: "20:00" },
//     4: { start: "08:00", end: "20:00" },
//     5: { start: "08:00", end: "20:00" },
//     6: { start: "08:00", end: "20:00" },
//   },
//   workHours: 8, // Maximum work hours per day
//   timezone: "America/New_York", // Time zone setting
//   minuteIncrement: 15, // Minute increment setting
//   permissibleStartRule: "every :15", // Permissible start rule
// };

// // Mock serviceId
// const serviceId = "service_123";

// // Define the test time range
// const timeMin = new Date().toISOString(); // Now
// const timeMax = new Date(
//   new Date().setDate(new Date().getDate() + 5)
// ).toISOString(); // 5 days from now

// const duration = 60; // 1 hour

// (async () => {
//   const results = await makeAvailabilities(
//     freeBusyResponse,
//     timeMin,
//     timeMax,
//     duration,
//     serviceId,
//     adminSettings
//   );

//   console.log("Availabilities:", results);
// })();