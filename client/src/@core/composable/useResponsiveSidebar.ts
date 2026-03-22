import { ref, watch, type Ref } from 'vue'
import { useDisplay } from 'vuetify'

export interface UseResponsiveSidebarReturn {
  isLeftSidebarOpen: Ref<boolean>
}

export const useResponsiveSidebar = (
  mobileBreakpoint: Ref<boolean> | undefined = undefined
): UseResponsiveSidebarReturn => {
  const { mdAndDown, name: currentBreakpoint } = useDisplay()

  const _mobileBreakpoint = mobileBreakpoint || mdAndDown

  const isLeftSidebarOpen = ref(true)

  const setInitialValue = () => {
    isLeftSidebarOpen.value = !_mobileBreakpoint.value
  }

  setInitialValue()

  watch(
    currentBreakpoint,
    () => {
      isLeftSidebarOpen.value = !_mobileBreakpoint.value
    },
  )

  return {
    isLeftSidebarOpen,
  }
}
