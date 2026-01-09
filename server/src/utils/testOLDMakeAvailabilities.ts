// import { makeAvailabilities } from './OLDmakeAvailabilties.js'

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



// const timeMin = "2024-01-26T08:00:00-05:00";
// const timeMax = "2024-01-26T18:00:00-05:00";
// const timezone = "America/New_York";
// const minuteIncrement = 15;
// const permissibleStartRule = "every :15";
// const duration = 60; // 1 hour

// const results = makeAvailabilities(
//     freeBusyResponse,
//     timeMin,
//     timeMax,
//     timezone,
//     minuteIncrement,
//     permissibleStartRule,
//     duration
// );

// console.log('Availabilities:', results);
