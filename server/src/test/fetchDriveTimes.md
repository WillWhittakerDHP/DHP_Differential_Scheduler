// import axios from "axios";
// import { fetchDriveTimes } from "../routes/external/googleFetchRoutes";

// jest.mock("axios");
// const mockedAxios = axios as jest.Mocked<typeof axios>;

// describe("fetchDriveTimes", () => {
//   const origin = "Chicago, IL";
//   const busyStart = "Joplin, MO";
//   const busyEnd = "Kansas City, MO";

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it("should return DriveTimeTo and DriveTimeFrom on success", async () => {
//     mockedAxios.get
//       .mockResolvedValueOnce({
//         data: {
//           status: "OK",
//           routes: [
//             {
//               legs: [
//                 {
//                   duration: { value: 21600 }, // 6 hours in seconds
//                 },
//               ],
//             },
//           ],
//         },
//       })
//       .mockResolvedValueOnce({
//         data: {
//           status: "OK",
//           routes: [
//             {
//               legs: [
//                 {
//                   duration: { value: 7200 }, // 2 hours in seconds
//                 },
//               ],
//             },
//           ],
//         },
//       });

//     const result = await fetchDriveTimes(origin, busyStart, busyEnd);
//     expect(result).toEqual({
//       DriveTimeTo: 360, // 6 hours in minutes
//       DriveTimeFrom: 120, // 2 hours in minutes
//     });

//     expect(mockedAxios.get).toHaveBeenCalledTimes(2);
//   });

//   it("should handle errors in DriveTimeTo fetch gracefully", async () => {
//     mockedAxios.get.mockRejectedValueOnce(new Error("Google API error"));

//     const result = await fetchDriveTimes(origin, busyStart, busyEnd);
//     expect(result).toEqual({
//       DriveTimeTo: 0,
//       DriveTimeFrom: 0,
//     });

//     expect(mockedAxios.get).toHaveBeenCalledTimes(1);
//   });

//   it("should handle errors in DriveTimeFrom fetch gracefully", async () => {
//     mockedAxios.get
//       .mockResolvedValueOnce({
//         data: {
//           status: "OK",
//           routes: [
//             {
//               legs: [
//                 {
//                   duration: { value: 21600 }, // 6 hours in seconds
//                 },
//               ],
//             },
//           ],
//         },
//       })
//       .mockRejectedValueOnce(new Error("Google API error"));

//     const result = await fetchDriveTimes(origin, busyStart, busyEnd);
//     expect(result).toEqual({
//       DriveTimeTo: 360, // 6 hours in minutes
//       DriveTimeFrom: 0, // Default due to error
//     });

//     expect(mockedAxios.get).toHaveBeenCalledTimes(2);
//   });

//   it("should handle missing busyEnd by only fetching DriveTimeTo", async () => {
//     mockedAxios.get.mockResolvedValueOnce({
//       data: {
//         status: "OK",
//         routes: [
//           {
//             legs: [
//               {
//                 duration: { value: 21600 }, // 6 hours in seconds
//               },
//             ],
//           },
//         ],
//       },
//     });

//     const result = await fetchDriveTimes(origin, busyStart);
//     expect(result).toEqual({
//       DriveTimeTo: 360, // 6 hours in minutes
//       DriveTimeFrom: 0, // Default as busyEnd is not provided
//     });

//     expect(mockedAxios.get).toHaveBeenCalledTimes(1);
//   });
// });
