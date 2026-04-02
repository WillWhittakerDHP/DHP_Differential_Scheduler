/**
 * Request/response for admin Event Instance template preview against a real appointment.
 */
export interface EventInstancePreviewRequestBody {
  appointmentId: string
  /** Persisted event_instances.id — link strip flags and segment identity come from this row. */
  eventInstanceId: string
  titleTemplate: string | null
  descriptionTemplate: string | null
  locationTemplate: string | null
}

export interface EventInstancePreviewResponseBody {
  summary: string
  description: string
  location: string
}
