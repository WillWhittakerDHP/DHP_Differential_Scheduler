/**
 * PATTERN: Theme/skin/layout/direction/contentWidth option arrays for Theme Customizer.
 * WHY: Keeps TheCustomizer.vue under vue-architecture script line limit.
 */
import { computed } from 'vue'
import { Direction, Layout, Skins, Theme } from '@core/enums'
import { ContentWidth } from '@layouts/enums'
import horizontalLight from '@images/customizer-icons/horizontal-light.svg'
import borderSkin from '@images/customizer-icons/border-light.svg'
import collapsed from '@images/customizer-icons/collapsed-light.svg'
import compact from '@images/customizer-icons/compact-light.svg'
import defaultSkin from '@images/customizer-icons/default-light.svg'
import ltrSvg from '@images/customizer-icons/ltr-light.svg'
import rtlSvg from '@images/customizer-icons/rtl-light.svg'
import wideSvg from '@images/customizer-icons/wide-light.svg'

export function useCustomizerOptions() {
  const themeMode = computed(() => [
    { bgImage: 'tabler-sun', value: Theme.Light, label: 'Light' },
    { bgImage: 'tabler-moon-stars', value: Theme.Dark, label: 'Dark' },
    { bgImage: 'tabler-device-desktop-analytics', value: Theme.System, label: 'System' },
  ])
  const themeSkin = computed(() => [
    { bgImage: defaultSkin, value: Skins.Default, label: 'Default' },
    { bgImage: borderSkin, value: Skins.Bordered, label: 'Bordered' },
  ])
  const layouts = computed(() => [
    { bgImage: defaultSkin, value: Layout.Vertical, label: 'Vertical' },
    { bgImage: collapsed, value: Layout.Collapsed, label: 'Collapsed' },
    { bgImage: horizontalLight, value: Layout.Horizontal, label: 'Horizontal' },
  ])
  const contentWidth = computed(() => [
    { bgImage: compact, value: ContentWidth.Boxed, label: 'Compact' },
    { bgImage: wideSvg, value: ContentWidth.Fluid, label: 'Wide' },
  ])
  const direction = computed(() => [
    { bgImage: ltrSvg, value: Direction.Ltr, label: 'Left to right' },
    { bgImage: rtlSvg, value: Direction.Rtl, label: 'Right to left' },
  ])
  return { themeMode, themeSkin, layouts, contentWidth, direction }
}
