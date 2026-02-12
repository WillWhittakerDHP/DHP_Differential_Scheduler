/**
 * Beta Feedback API endpoint builders
 * WHY: Single place for beta feedback CRUD and stats endpoints
 */

export function getBetaFeedbackEndpoint(): string {
  return '/beta-feedback';
}

export function getBetaFeedbackByIdEndpoint(id: string): string {
  return `/beta-feedback/${id}`;
}

export function getBetaFeedbackStatsEndpoint(): string {
  return '/beta-feedback/stats';
}
