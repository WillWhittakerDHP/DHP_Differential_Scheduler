import axios from "axios";

interface DriveTimes {
  DriveTimeTo: number;
  DriveTimeFrom: number;
}

const GOOGLE_MAPS_API_URL = "https://maps.googleapis.com/maps/api/directions/json";
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const driveTimeCache = new Map<string, DriveTimes>();

export async function fetchDriveTimes(
  origin: string,
  busyStart: string,
  busyEnd?: string
): Promise<DriveTimes> {
  const cacheKey = `${origin}-${busyStart}-${busyEnd || "none"}`;

  if (driveTimeCache.has(cacheKey)) {
    return driveTimeCache.get(cacheKey)!;
  }

  try {
    const toRouteResponse = await axios.get(GOOGLE_MAPS_API_URL, {
      params: {
        origin,
        destination: busyStart,
        mode: "driving",
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    if (toRouteResponse.data.status !== "OK") {
      console.error(
        `Google Maps API error for DriveTimeTo: ${toRouteResponse.data.status}`
      );
      throw new Error(`Google Maps API error for DriveTimeTo`);
    }

    const DriveTimeTo = toRouteResponse.data.routes[0].legs[0].duration.value;

    let DriveTimeFrom = 0;

    if (busyEnd) {
      const fromRouteResponse = await axios.get(GOOGLE_MAPS_API_URL, {
        params: {
          origin: busyStart,
          destination: busyEnd,
          mode: "driving",
          key: GOOGLE_MAPS_API_KEY,
        },
      });

      if (fromRouteResponse.data.status !== "OK") {
        console.error(
          `Google Maps API error for DriveTimeFrom: ${fromRouteResponse.data.status}`
        );
        throw new Error(`Google Maps API error for DriveTimeFrom`);
      }

      DriveTimeFrom = fromRouteResponse.data.routes[0].legs[0].duration.value;
    }

    const roundedDriveTimes: DriveTimes = {
      DriveTimeTo: Math.ceil(DriveTimeTo / 60),
      DriveTimeFrom: Math.ceil(DriveTimeFrom / 60),
    };

    driveTimeCache.set(cacheKey, roundedDriveTimes);

    return roundedDriveTimes;
  } catch (error) {
    console.error("Error in fetchDriveTimes:", error);
    return {
      DriveTimeTo: 0, // Default values in case of an error
      DriveTimeFrom: 0,
    };
  }
}
