/**
 * Maps API error class (standalone so dual-role audit does not flag service + class together).
 */

import type { MapsApiErrorType } from '@shared/types/mapsTypes'

export class MapsApiError extends Error {
  constructor(
    public type: MapsApiErrorType,
    message: string,
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'MapsApiError'
  }
}
