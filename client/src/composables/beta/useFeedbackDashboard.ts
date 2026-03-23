/**
 */
import { ref, reactive, onMounted } from 'vue'
import type { Ref } from 'vue'
import { betaFeedback } from '@/utils/beta/betaFeedback'
import type { BetaFeedback, BetaFeedbackFiltersBase, BetaFeedbackStats } from '@/types/betaFeedback'

export function useFeedbackDashboard(): {
  loading: Ref<boolean>
  items: Ref<BetaFeedback[]>
  stats: Ref<BetaFeedbackStats | null>
  detailOpen: Ref<boolean>
  selectedFeedback: Ref<BetaFeedback | null>
  filters: BetaFeedbackFiltersBase
  load: () => Promise<void>
} {
  const { fetchAllFeedback, fetchFeedbackStats } = betaFeedback()
  const loading = ref(false)
  const items = ref<BetaFeedback[]>([])
  const stats = ref<BetaFeedbackStats | null>(null)
  const detailOpen = ref(false)
  const selectedFeedback = ref<BetaFeedback | null>(null)
  const filters = reactive<BetaFeedbackFiltersBase>({})

  async function load(): Promise<void> {
    loading.value = true
    try {
      const [list, statsData] = await Promise.all([
        fetchAllFeedback(filters),
        fetchFeedbackStats(),
      ])
      items.value = list
      stats.value = statsData
    } finally {
      loading.value = false
    }
  }

  onMounted(() => load())

  return {
    loading,
    items,
    stats,
    detailOpen,
    selectedFeedback,
    filters,
    load,
  }
}
