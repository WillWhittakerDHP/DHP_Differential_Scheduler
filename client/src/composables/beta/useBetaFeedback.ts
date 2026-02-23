/**
 * PATTERN: useBetaFeedback Composable
PATTERN: Composable that returns async functi...
 */
import apiClient, {
  getBetaFeedbackEndpoint,
  getBetaFeedbackByIdEndpoint,
  getBetaFeedbackStatsEndpoint,
} from '@/utils/api';
import type {
  BetaFeedback,
  BetaFeedbackSubmission,
  BetaFeedbackStats,
  BetaFeedbackFilters,
} from '@/types/betaFeedback';

export function useBetaFeedback() {
  async function fetchAllFeedback(filters?: BetaFeedbackFilters): Promise<BetaFeedback[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.severity) params.set('severity', filters.severity);
    const query = params.toString();
    const url = query ? `${getBetaFeedbackEndpoint()}?${query}` : getBetaFeedbackEndpoint();
    const { data } = await apiClient.get<BetaFeedback[]>(url);
    return data;
  }

  async function fetchFeedbackStats(): Promise<BetaFeedbackStats> {
    const { data } = await apiClient.get<BetaFeedbackStats>(getBetaFeedbackStatsEndpoint());
    return data;
  }

  async function submitFeedback(payload: BetaFeedbackSubmission): Promise<BetaFeedback> {
    const { data } = await apiClient.post<BetaFeedback>(getBetaFeedbackEndpoint(), payload);
    return data;
  }

  async function updateFeedback(
    id: string,
    payload: { status?: BetaFeedback['status']; resolutionNotes?: string | null }
  ): Promise<BetaFeedback> {
    const { data } = await apiClient.patch<BetaFeedback>(
      getBetaFeedbackByIdEndpoint(id),
      payload
    );
    return data;
  }

  async function deleteFeedback(id: string): Promise<void> {
    await apiClient.delete(getBetaFeedbackByIdEndpoint(id));
  }

  return {
    fetchAllFeedback,
    fetchFeedbackStats,
    submitFeedback,
    updateFeedback,
    deleteFeedback,
  };
}
