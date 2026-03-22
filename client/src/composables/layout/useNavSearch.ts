/**
 */
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { withQuery } from 'ufo'
import api from '@/utils/api'

export interface SearchResultsGroup {
  title: string
  children: Array<{ icon: string; title: string; url: RouteLocationRaw }>
}

export function useNavSearch(): {
  searchQuery: Ref<string>
  searchResult: Ref<SearchResultsGroup[]>
  isLoading: Ref<boolean>
  fetchResults: () => Promise<void>
} {
  const searchQuery = ref('')
  const searchResult = ref<SearchResultsGroup[]>([])
  const isLoading = ref(false)

  async function fetchResults(): Promise<void> {
    isLoading.value = true
    try {
      const response = await api.get<SearchResultsGroup[]>(
        withQuery('/app-bar/search', { q: searchQuery.value })
      )
      searchResult.value = response.data
    } finally {
      setTimeout(() => {
        isLoading.value = false
      }, 500)
    }
  }

  watch(searchQuery, fetchResults)

  return { searchQuery, searchResult, isLoading, fetchResults }
}
