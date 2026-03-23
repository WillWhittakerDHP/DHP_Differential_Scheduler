/**
 * WHY: Named merge steps for drive-time matrix + cache (keeps calculateDriveTimesForPlaceIds shallow for audits).
 */

import type { RouteLocation, RouteMatrixResult } from '../services/google/maps/mapsTypes.js'
import { getCachedDriveTime, cacheDriveTime } from '../services/driveTimeCache.js'

type DriveLegsPerPlace = Record<string, { driveToCandidate?: number; driveFromCandidate?: number }>

type DriveTimeCacheAccumulator = {
  results: DriveLegsPerPlace
  uncachedTo: string[]
  uncachedFrom: string[]
}

function extendAccumulatorForPlaceId(
  acc: DriveTimeCacheAccumulator,
  eventPlaceId: string,
  candidateLocation: RouteLocation
): DriveTimeCacheAccumulator {
  const eventLocationRoute: RouteLocation = { placeId: eventPlaceId }
  const cachedTo = getCachedDriveTime(eventLocationRoute, candidateLocation)
  const cachedFrom = getCachedDriveTime(candidateLocation, eventLocationRoute)
  const existingResult = acc.results[eventPlaceId]
  const nextEntry: { driveToCandidate?: number; driveFromCandidate?: number } = {
    ...(existingResult !== undefined && existingResult !== null ? existingResult : {}),
    ...(cachedTo
      ? // @audit-allow:hardcoding:fieldMapping - API drive-time payload shape
        { driveToCandidate: Math.ceil(cachedTo.durationSeconds / 60) }
      : {}),
    ...(cachedFrom
      ? // @audit-allow:hardcoding:fieldMapping - API drive-time payload shape
        { driveFromCandidate: Math.ceil(cachedFrom.durationSeconds / 60) }
      : {}),
  }
  return {
    results: { ...acc.results, [eventPlaceId]: nextEntry },
    uncachedTo: cachedTo ? acc.uncachedTo : [...acc.uncachedTo, eventPlaceId],
    uncachedFrom: cachedFrom ? acc.uncachedFrom : [...acc.uncachedFrom, eventPlaceId],
  }
}

export function accumulateCachedDriveEntries(
  uniquePlaceIds: string[],
  candidateLocation: RouteLocation
): DriveTimeCacheAccumulator {
  const empty: DriveTimeCacheAccumulator = { results: {}, uncachedTo: [], uncachedFrom: [] }
  return uniquePlaceIds.reduce<DriveTimeCacheAccumulator>(
    (acc, eventPlaceId) => extendAccumulatorForPlaceId(acc, eventPlaceId, candidateLocation),
    empty
  )
}

export function applyMatrixToResultsToLeg(
  uncachedToPlaceIds: string[],
  toResults: RouteMatrixResult[],
  baseResults: DriveLegsPerPlace,
  candidateLocation: RouteLocation,
  logRouteNotFound: (eventPlaceId: string, result: RouteMatrixResult) => void
): DriveLegsPerPlace {
  let updates: DriveLegsPerPlace = {}
  for (const result of toResults) {
    if (result.status === 'OK' && result.durationSeconds > 0) {
      const eventPlaceId = uncachedToPlaceIds[result.originIndex]
      const eventLocationRoute: RouteLocation = { placeId: eventPlaceId }
      cacheDriveTime(
        eventLocationRoute,
        candidateLocation,
        result.durationSeconds,
        result.distanceMeters
      )
      updates = {
        ...updates,
        [eventPlaceId]: {
          ...baseResults[eventPlaceId],
          ...updates[eventPlaceId],
          driveToCandidate: Math.ceil(result.durationSeconds / 60),
        },
      }
      continue
    }
    if (result.status !== 'OK') {
      logRouteNotFound(uncachedToPlaceIds[result.originIndex], result)
    }
  }
  return { ...baseResults, ...updates }
}

export function applyMatrixToResultsFromLeg(
  uncachedFromPlaceIds: string[],
  fromResults: RouteMatrixResult[],
  baseResults: DriveLegsPerPlace,
  candidateLocation: RouteLocation,
  logRouteNotFound: (eventPlaceId: string, result: RouteMatrixResult) => void
): DriveLegsPerPlace {
  let updates: DriveLegsPerPlace = {}
  for (const result of fromResults) {
    if (result.status === 'OK' && result.durationSeconds > 0) {
      const eventPlaceId = uncachedFromPlaceIds[result.destinationIndex]
      const eventLocationRoute: RouteLocation = { placeId: eventPlaceId }
      cacheDriveTime(
        candidateLocation,
        eventLocationRoute,
        result.durationSeconds,
        result.distanceMeters
      )
      updates = {
        ...updates,
        [eventPlaceId]: {
          ...baseResults[eventPlaceId],
          ...updates[eventPlaceId],
          driveFromCandidate: Math.ceil(result.durationSeconds / 60),
        },
      }
      continue
    }
    if (result.status !== 'OK') {
      logRouteNotFound(uncachedFromPlaceIds[result.destinationIndex], result)
    }
  }
  return { ...baseResults, ...updates }
}
