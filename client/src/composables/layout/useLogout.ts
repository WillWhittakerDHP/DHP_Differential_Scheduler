/**
 */
import { useRouter } from 'vue-router'
import { useAbility } from '@casl/vue'
import { useCookie } from '@/@core/composable/useCookie'

export function useLogout(): () => Promise<void> {
  const router = useRouter()
  const ability = useAbility()

  return async function logout(): Promise<void> {
    useCookie('accessToken').value = null
    useCookie('userData').value = null
    await router.push('/login')
    useCookie('userAbilityRules').value = null
    ability.update([])
  }
}
