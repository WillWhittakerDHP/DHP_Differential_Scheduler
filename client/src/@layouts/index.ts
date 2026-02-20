import type { PartialDeep } from 'type-fest'
import type { Plugin } from 'vue'
import { layoutConfig } from '@layouts/config'
import { cookieRef, useLayoutConfigStore } from '@layouts/stores/config'
import type { LayoutConfig } from '@layouts/types'
import { _setDirAttr } from '@layouts/utils'

export const createLayouts = (userConfig: PartialDeep<LayoutConfig>): Plugin => {
  return (): void => {
    const configStore = useLayoutConfigStore()

    layoutConfig.app.title = userConfig.app?.title ?? layoutConfig.app.title
    layoutConfig.app.logo = (userConfig.app?.logo ?? layoutConfig.app.logo) as typeof layoutConfig.app.logo
    layoutConfig.app.overlayNavFromBreakpoint = userConfig.app?.overlayNavFromBreakpoint ?? layoutConfig.app.overlayNavFromBreakpoint
    layoutConfig.app.i18n.enable = userConfig.app?.i18n?.enable ?? layoutConfig.app.i18n.enable
    layoutConfig.app.iconRenderer = userConfig.app?.iconRenderer as LayoutConfig['app']['iconRenderer'] ?? layoutConfig.app.iconRenderer

    layoutConfig.verticalNav.defaultNavItemIconProps = userConfig.verticalNav?.defaultNavItemIconProps ?? layoutConfig.verticalNav.defaultNavItemIconProps

    layoutConfig.icons.chevronDown = (userConfig.icons?.chevronDown ?? layoutConfig.icons.chevronDown) as LayoutConfig['icons']['chevronDown']
    layoutConfig.icons.chevronRight = (userConfig.icons?.chevronRight ?? layoutConfig.icons.chevronRight) as LayoutConfig['icons']['chevronRight']
    layoutConfig.icons.close = (userConfig.icons?.close ?? layoutConfig.icons.close) as LayoutConfig['icons']['close']
    layoutConfig.icons.verticalNavPinned = (userConfig.icons?.verticalNavPinned ?? layoutConfig.icons.verticalNavPinned) as LayoutConfig['icons']['verticalNavPinned']
    layoutConfig.icons.verticalNavUnPinned = (userConfig.icons?.verticalNavUnPinned ?? layoutConfig.icons.verticalNavUnPinned) as LayoutConfig['icons']['verticalNavUnPinned']
    layoutConfig.icons.sectionTitlePlaceholder = (userConfig.icons?.sectionTitlePlaceholder ?? layoutConfig.icons.sectionTitlePlaceholder) as LayoutConfig['icons']['sectionTitlePlaceholder']

    configStore.$patch({
      appContentLayoutNav: cookieRef('appContentLayoutNav', userConfig.app?.contentLayoutNav ?? layoutConfig.app.contentLayoutNav).value,
      appContentWidth: cookieRef('appContentWidth', userConfig.app?.contentWidth ?? layoutConfig.app.contentWidth).value,
      footerType: cookieRef('footerType', userConfig.footer?.type ?? layoutConfig.footer.type).value,
      navbarType: cookieRef('navbarType', userConfig.navbar?.type ?? layoutConfig.navbar.type).value,
      isNavbarBlurEnabled: cookieRef('isNavbarBlurEnabled', userConfig.navbar?.navbarBlur ?? layoutConfig.navbar.navbarBlur).value,
      isVerticalNavCollapsed: cookieRef('isVerticalNavCollapsed', userConfig.verticalNav?.isVerticalNavCollapsed ?? layoutConfig.verticalNav.isVerticalNavCollapsed).value,

      horizontalNavType: cookieRef('horizontalNavType', userConfig.horizontalNav?.type ?? layoutConfig.horizontalNav.type).value,
    })

    _setDirAttr(configStore.isAppRTL ? 'rtl' : 'ltr')
  }
}

export { default as HorizontalNav } from './components/HorizontalNav.vue'
export { default as HorizontalNavGroup } from './components/HorizontalNavGroup.vue'
export { default as HorizontalNavLayout } from './components/HorizontalNavLayout.vue'
export { default as HorizontalNavLink } from './components/HorizontalNavLink.vue'
export { default as HorizontalNavPopper } from './components/HorizontalNavPopper.vue'
export { default as TransitionExpand } from './components/TransitionExpand.vue'
export { default as VerticalNav } from './components/VerticalNav.vue'
export { default as VerticalNavGroup } from './components/VerticalNavGroup.vue'
export { default as VerticalNavLayout } from './components/VerticalNavLayout.vue'
export { default as VerticalNavLink } from './components/VerticalNavLink.vue'
export { default as VerticalNavSectionTitle } from './components/VerticalNavSectionTitle.vue'
export { layoutConfig }
