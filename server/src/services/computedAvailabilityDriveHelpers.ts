import type { CalendarEvent } from '../../../shared/types/availabilityTypes.js'
import { calculateRouteMatrix } from './google/maps/routesApiService.js'
import { MapsApiError } from './google/maps/mapsErrorHandler.js'
import type { RouteLocation } from './google/maps/mapsTypes.js'
import { withRetry } from './google/shared/googleApiRetry.js'
import { createLogger } from '../utils/logger.js'
import { GOOGLE_API_STATUS } from './google/maps/mapsConstants.js'
import { getCachedDriveTime, cacheDriveTime } from './driveTimeCache.js'
import {
  accumulateCachedDriveEntries,
  applyMatrixToResultsFromLeg,
  applyMatrixToResultsToLeg,
} from '../utils/driveTimeMatrixMerge.js'

const logger = createLogger('ComputedAvailabilityDriveHelpers')

async function fetchAndMergeDriveToLeg(
  uncachedToPlaceIds: string[],
  candidateLocation: RouteLocation,
  baseResults: Record<string, { driveToCandidate?: number; driveFromCandidate?: number }>
): Promise<Record<string, { driveToCandidate?: number; driveFromCandidate?: number }>> {
  if (uncachedToPlaceIds.length === 0) {
    return baseResults
  }
  try {
    const uncachedToLocations: RouteLocation[] = uncachedToPlaceIds.map((pid) => ({ placeId: pid }))
    const toResults = await withRetry(
      () => calculateRouteMatrix(uncachedToLocations, [candidateLocation], true),
      (error) => error instanceof MapsApiError && error.retryable
    )
    return applyMatrixToResultsToLeg(
      uncachedToPlaceIds,
      toResults,
      baseResults,
      candidateLocation,
      (eventPlaceId, result) => {
        logger.warn(`Route not found for driveToCandidate: placeId ${eventPlaceId}`, {
          status: result.status,
          condition: result.condition,
        })
      }
    )
  } catch (error) {
    logger.error('Failed to batch calculate driveToCandidate', { error, placeIds: uncachedToPlaceIds })
    return baseResults
  }
}

async function fetchAndMergeDriveFromLeg(
  uncachedFromPlaceIds: string[],
  candidateLocation: RouteLocation,
  baseResults: Record<string, { driveToCandidate?: number; driveFromCandidate?: number }>
): Promise<Record<string, { driveToCandidate?: number; driveFromCandidate?: number }>> {
  if (uncachedFromPlaceIds.length === 0) {
    return baseResults
  }
  try {
    const uncachedFromLocations: RouteLocation[] = uncachedFromPlaceIds.map((pid) => ({ placeId: pid }))
    const fromResults = await withRetry(
      () => calculateRouteMatrix([candidateLocation], uncachedFromLocations, true),
      (error) => error instanceof MapsApiError && error.retryable
    )
    return applyMatrixToResultsFromLeg(
      uncachedFromPlaceIds,
      fromResults,
      baseResults,
      candidateLocation,
      (eventPlaceId, result) => {
        logger.warn(`Route not found for driveFromCandidate: placeId ${eventPlaceId}`, {
          status: result.status,
          condition: result.condition,
        })
      }
    )
  } catch (error) {
    logger.error('Failed to batch calculate driveFromCandidate', {
      error,
      placeIds: uncachedFromPlaceIds,
    })
    return baseResults
  }
}

export async function calculateDriveTimesForPlaceIds(
  calendarEvents: CalendarEvent[],
  candidatePlaceId: string | undefined
): Promise<Record<string, { driveToCandidate?: number; driveFromCandidate?: number }>> {
  if (!candidatePlaceId) {
    logger.debug('Skipping drive time calculation: no candidate placeId provided')
    return {}
  }

  const uniquePlaceIds = [
    ...new Set(
      calendarEvents
        .map((event) => event.placeId)
        .filter((placeId): placeId is string => !!placeId)
    ),
  ]

  if (uniquePlaceIds.length === 0) {
    return {}
  }

  const candidateLocationRoute: RouteLocation = { placeId: candidatePlaceId }
  const { results, uncachedTo: uncachedToPlaceIds, uncachedFrom: uncachedFromPlaceIds } =
    accumulateCachedDriveEntries(uniquePlaceIds, candidateLocationRoute)

  logger.debug('Drive time cache check', {
    totalPlaceIds: uniquePlaceIds.length,
    cachedTo: uniquePlaceIds.length - uncachedToPlaceIds.length,
    cachedFrom: uniquePlaceIds.length - uncachedFromPlaceIds.length,
    uncachedTo: uncachedToPlaceIds.length,
    uncachedFrom: uncachedFromPlaceIds.length,
  })

  const batchStartTime = Date.now()
  const resultsAfterTo = await fetchAndMergeDriveToLeg(
    uncachedToPlaceIds,
    candidateLocationRoute,
    results
  )
  const resultsFinal = await fetchAndMergeDriveFromLeg(
    uncachedFromPlaceIds,
    candidateLocationRoute,
    resultsAfterTo
  )

  const batchDuration = Date.now() - batchStartTime
  if (uncachedToPlaceIds.length > 0 || uncachedFromPlaceIds.length > 0) {
    logger.info(`Batched drive time calculation complete`, {
      durationMs: batchDuration,
      totalPlaceIds: uniquePlaceIds.length,
      apiCallsMade: (uncachedToPlaceIds.length > 0 ? 1 : 0) + (uncachedFromPlaceIds.length > 0 ? 1 : 0),
    })
  }

  return resultsFinal
}

/**
 * Fee context: drive minutes default location → candidate and candidate → default (Routes API + cache).
 */
export async function resolveDefaultLocationCandidateDriveLegsMinutes(
  defaultPlaceId: string | undefined,
  candidatePlaceId: string | undefined
): Promise<{ driveToCandidate: number; driveFromCandidate: number }> {
  if (!defaultPlaceId?.trim() || !candidatePlaceId?.trim()) {
    return { driveToCandidate: 0, driveFromCandidate: 0 }
  }
  // @audit-allow:hardcoding:fieldMapping - Routes API origin/destination payload uses placeId
  const def: RouteLocation = { placeId: defaultPlaceId.trim() }
  // @audit-allow:hardcoding:fieldMapping - Routes API origin/destination payload uses placeId
  const cand: RouteLocation = { placeId: candidatePlaceId.trim() }

  let driveToCandidate = 0
  let driveFromCandidate = 0
  const cachedTo = getCachedDriveTime(def, cand)
  if (cachedTo) {
    driveToCandidate = Math.ceil(cachedTo.durationSeconds / 60)
  }
  const cachedFrom = getCachedDriveTime(cand, def)
  if (cachedFrom) {
    driveFromCandidate = Math.ceil(cachedFrom.durationSeconds / 60)
  }

  try {
    if (!cachedTo) {
      const toResults = await withRetry(
        () => calculateRouteMatrix([def], [cand], true),
        (error) => error instanceof MapsApiError && error.retryable
      )
      const r = toResults[0]
      if (r && r.status === GOOGLE_API_STATUS.OK && r.durationSeconds > 0) {
        cacheDriveTime(def, cand, r.durationSeconds, r.distanceMeters)
        driveToCandidate = Math.ceil(r.durationSeconds / 60)
      }
    }
    if (!cachedFrom) {
      const fromResults = await withRetry(
        () => calculateRouteMatrix([cand], [def], true),
        (error) => error instanceof MapsApiError && error.retryable
      )
      const r = fromResults[0]
      if (r && r.status === GOOGLE_API_STATUS.OK && r.durationSeconds > 0) {
        cacheDriveTime(cand, def, r.durationSeconds, r.distanceMeters)
        driveFromCandidate = Math.ceil(r.durationSeconds / 60)
      }
    }
  } catch (error) {
    logger.warn('resolveDefaultLocationCandidateDriveLegsMinutes: route lookup failed', { error })
  }

  return { driveToCandidate, driveFromCandidate }
}
