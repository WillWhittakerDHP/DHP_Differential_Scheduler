
import { createLogger } from '../../../utils/logger.js'
import { withRateLimit } from '../shared/googleApiRateLimiter.js'
import { getGoogleMapsApiKey, ROUTES_API_BASE } from '../shared/googleApiConfig.js'
import { GOOGLE_API_STATUS, ROUTES_CONDITION_NOT_FOUND } from './mapsConstants.js'
import { MapsApiError } from './mapsErrorHandler.js'
import { toRoutesWaypoint } from './mapsHelpers.js'
import type {
  RouteLocation,
  RouteMatrixResult,
  RouteMatrixStatus,
} from './mapsTypes.js'

const logger = createLogger('RoutesApiService')

function parseRouteMatrixItem(item: { duration?: string; distanceMeters?: number; originIndex?: number; destinationIndex?: number; condition?: string }): RouteMatrixResult {
  let durationSeconds = 0
  if (item.duration) {
    const match = item.duration.match(/^(\d+)s$/)
    if (match) durationSeconds = parseInt(match[1], 10)
  }
  let status: RouteMatrixStatus = GOOGLE_API_STATUS.OK
  if (item.condition === ROUTES_CONDITION_NOT_FOUND) status = GOOGLE_API_STATUS.NOT_FOUND
  else if (!item.distanceMeters || durationSeconds === 0) status = GOOGLE_API_STATUS.ZERO_RESULTS
  return {
    originIndex: item.originIndex ?? 0,
    destinationIndex: item.destinationIndex ?? 0,
    durationSeconds,
    distanceMeters: item.distanceMeters ?? 0,
    status,
    condition: item.condition
  }
}

function buildRouteMatrixRequestBody(
  origins: RouteLocation[],
  destinations: RouteLocation[],
  useTraffic: boolean
): {
  origins: Array<{ waypoint: ReturnType<typeof toRoutesWaypoint> }>
  destinations: Array<{ waypoint: ReturnType<typeof toRoutesWaypoint> }>
  travelMode: string
  routingPreference: string
} {
  return {
    origins: origins.map((origin) => ({ waypoint: toRoutesWaypoint(origin) })),
    destinations: destinations.map((dest) => ({ waypoint: toRoutesWaypoint(dest) })),
    travelMode: 'DRIVE',
    routingPreference: useTraffic ? 'TRAFFIC_AWARE' : 'TRAFFIC_UNAWARE',
  }
}

async function fetchRouteMatrixFromApi(
  apiKey: string,
  requestBody: ReturnType<typeof buildRouteMatrixRequestBody>
): Promise<RouteMatrixResult[]> {
  const url = `${ROUTES_API_BASE}/distanceMatrix/v2:computeRouteMatrix`
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,status,condition',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('Routes API HTTP error', { status: response.status, errorText })

      if (response.status === 401 || response.status === 403) {
        throw new MapsApiError('auth', `API key invalid or Routes API not enabled: ${errorText}`)
      }
      if (response.status === 429) {
        throw new MapsApiError('rate_limit', 'Routes API quota exceeded', true)
      }

      throw new MapsApiError('network', `HTTP error: ${response.status}`, response.status >= 500)
    }

    const data: unknown = await response.json()

    if (!Array.isArray(data)) {
      logger.error('Unexpected response format', { data })
      throw new MapsApiError('invalid', 'Unexpected response format from Routes API')
    }

    const results: RouteMatrixResult[] = data.map((item: Record<string, unknown>) =>
      parseRouteMatrixItem(item as {
        duration?: string
        distanceMeters?: number
        originIndex?: number
        destinationIndex?: number
        condition?: string
      })
    )

    logger.debug('Route matrix complete', { resultsCount: results.length })

    return results
  } catch (error) {
    logger.error(error)
    if (error instanceof MapsApiError) {
      throw error
    }

    logger.error('Route matrix error', { error })
    throw new MapsApiError('network', error instanceof Error ? error.message : 'Network error', true)
  }
}

export async function calculateRouteMatrix(
  origins: RouteLocation[],
  destinations: RouteLocation[],
  useTraffic: boolean = true
): Promise<RouteMatrixResult[]> {
  if (!origins.length) {
    throw new MapsApiError('invalid', 'At least one origin is required')
  }
  if (!destinations.length) {
    throw new MapsApiError('invalid', 'At least one destination is required')
  }

  const elementCount = origins.length * destinations.length
  if (elementCount > 625) {
    throw new MapsApiError('invalid', `Element count ${elementCount} exceeds maximum 625`)
  }

  return await withRateLimit('google-maps', async () => {
    const apiKey = getGoogleMapsApiKey()
    const requestBody = buildRouteMatrixRequestBody(origins, destinations, useTraffic)
    return fetchRouteMatrixFromApi(apiKey, requestBody)
  })
}
