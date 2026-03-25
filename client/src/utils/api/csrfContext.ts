/**
 * WHY: Axios interceptor must read CSRF token without importing Pinia store (avoids circular import with apiClient).
 */
import { ref, type Ref } from 'vue'

export const globalCsrfToken: Ref<string | null> = ref<string | null>(null)
