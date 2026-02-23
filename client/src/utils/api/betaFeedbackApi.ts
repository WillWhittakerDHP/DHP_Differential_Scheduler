/**
 * Beta Feedback API endpoint builders
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
