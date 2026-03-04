/**
 * Injection key for Business Controls tab shared state.
 */
import type { InjectionKey } from 'vue'

 
export type BusinessControlsState = any

export const BUSINESS_CONTROLS_STATE_KEY: InjectionKey<BusinessControlsState> = Symbol('businessControlsState')
