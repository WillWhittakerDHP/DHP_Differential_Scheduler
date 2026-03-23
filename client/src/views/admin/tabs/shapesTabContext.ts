import type { InjectionKey } from 'vue'
import type { UseShapesTabReturn } from '@/types/admin/shapesTab'

/** Provided by ShapesTab.vue for tab panel subcomponents (component-health: split oversized template). */
export const shapesTabInjectionKey: InjectionKey<UseShapesTabReturn> = Symbol('shapesTab')
