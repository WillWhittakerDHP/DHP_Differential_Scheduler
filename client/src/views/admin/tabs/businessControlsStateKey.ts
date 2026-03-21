/**
 * Injection key for Business Controls tab shared state.
 */
import type { InjectionKey } from 'vue'
import type { BusinessControlsState } from '@/types/admin/businessControlsState'

export type { BusinessControlsState } from '@/types/admin/businessControlsState'

export const BUSINESS_CONTROLS_STATE_KEY: InjectionKey<BusinessControlsState> = Symbol('businessControlsState')
