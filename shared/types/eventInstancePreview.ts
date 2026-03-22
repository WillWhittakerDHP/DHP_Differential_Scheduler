/**
 * Request/response for admin Event Instance template preview against a real appointment.
 */
export interface EventInstancePreviewRequestBody {
  appointmentId: string
  eventShapeRef: string
  titleTemplate: string | null
  descriptionTemplate: string | null
  locationTemplate: string | null
}

export interface EventInstancePreviewResponseBody {
  summary: string
  description: string
  location: string
}
