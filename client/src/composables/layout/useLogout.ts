import { useRouter } from 'vue-router'
import { useAbility } from '@casl/vue'
import { useCookie } from '@/@core/composable/useCookie'
import { useAuthStore } from '@/stores/authStore'

export function useLogout(): () => Promise<void> {
  const router = useRouter()
  const ability = useAbility()
  const auth = useAuthStore()

  return async function logout(): Promise<void> {
    await auth.logout()
    useCookie('accessToken').value = null
    useCookie('userData').value = null
    useCookie('userAbilityRules').value = null
    ability.update([])
    await router.push('/login')
  }
}
