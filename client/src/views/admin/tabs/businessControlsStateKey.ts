/**
 * Injection key for Business Controls tab shared state.
 * WHY: Panels (Capacity, Overlap, GridConfig) inject this to avoid prop/emit drilling.
 */
import type { InjectionKey } from 'vue'

 
export type BusinessControlsState = any

export const BUSINESS_CONTROLS_STATE_KEY: InjectionKey<BusinessControlsState> = Symbol('businessControlsState')
