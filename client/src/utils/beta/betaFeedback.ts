/**
 * Beta feedback API client functions.
 */
import apiClient, {
  getBetaFeedbackEndpoint,
  getBetaFeedbackByIdEndpoint,
  getBetaFeedbackStatsEndpoint,
} from '@/utils/api'
import type {
  BetaFeedback,
  BetaFeedbackSubmission,
  BetaFeedbackStats,
  BetaFeedbackFiltersBase,
} from '@/types/betaFeedback'

interface BetaFeedbackReturn {
  fetchAllFeedback: (filters?: BetaFeedbackFiltersBase) => Promise<BetaFeedback[]>
  fetchFeedbackStats: () => Promise<BetaFeedbackStats>
  submitFeedback: (payload: BetaFeedbackSubmission) => Promise<BetaFeedback>
  updateFeedback: (
    id: string,
    payload: { status?: BetaFeedback['status']; resolutionNotes?: string | null }
  ) => Promise<BetaFeedback>
  deleteFeedback: (id: string) => Promise<void>
}

export function betaFeedback(): BetaFeedbackReturn {
  async function fetchAllFeedback(filters?: BetaFeedbackFiltersBase): Promise<BetaFeedback[]> {
    const params = new URLSearchParams()
    if (filters?.status) params.set('status', filters.status)
    if (filters?.category) params.set('category', filters.category)
    if (filters?.severity) params.set('severity', filters.severity)
    const query = params.toString()
    const url = query ? `${getBetaFeedbackEndpoint()}?${query}` : getBetaFeedbackEndpoint()
    const { data } = await apiClient.get<BetaFeedback[]>(url)
    return data
  }

  async function fetchFeedbackStats(): Promise<BetaFeedbackStats> {
    const { data } = await apiClient.get<BetaFeedbackStats>(getBetaFeedbackStatsEndpoint())
    return data
  }

  async function submitFeedback(payload: BetaFeedbackSubmission): Promise<BetaFeedback> {
    const { data } = await apiClient.post<BetaFeedback>(getBetaFeedbackEndpoint(), payload)
    return data
  }

  async function updateFeedback(
    id: string,
    payload: { status?: BetaFeedback['status']; resolutionNotes?: string | null }
  ): Promise<BetaFeedback> {
    const { data } = await apiClient.patch<BetaFeedback>(
      getBetaFeedbackByIdEndpoint(id),
      payload
    )
    return data
  }

  async function deleteFeedback(id: string): Promise<void> {
    await apiClient.delete(getBetaFeedbackByIdEndpoint(id))
  }

  return {
    fetchAllFeedback,
    fetchFeedbackStats,
    submitFeedback,
    updateFeedback,
    deleteFeedback,
  }
}
