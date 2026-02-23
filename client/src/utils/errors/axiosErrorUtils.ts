/**
 * Axios error extraction for user-facing messages.
 * WHY: Shared helper to reduce nesting/branches in composables that handle API errors.
 */

import type { AxiosError } from 'axios'

export interface ExtractedErrorMessage {
  message: string
  details?: string
}

function messageFromData(d: { details?: string; error?: string; message?: string }): string | undefined {
  if (d.details != null) return String(d.details)
  if (d.error != null) return String(d.error)
  if (d.message != null) return String(d.message)
  return undefined
}

export function extractAxiosErrorMessage(error: unknown): ExtractedErrorMessage {
  const fallback = error instanceof Error ? error.message : String(error)
  if (!error || typeof error !== 'object') return { message: fallback }
  const d = (error as AxiosError<{ error?: string; details?: string; message?: string }>).response?.data
  if (!d || typeof d !== 'object') return { message: fallback }
  const fromData = messageFromData(d)
  return { message: fromData ?? fallback, details: fromData ?? undefined }
}
