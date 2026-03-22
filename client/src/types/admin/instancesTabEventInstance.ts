import type { Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'
import type { AppLogger } from '@/utils/logger'

export interface UseInstancesTabEventInstanceParams {
  expandedInstances: Ref<string[]>
  eventShapes: Ref<GlobalEntity<'eventShape'>[]>
  createEventInstance: (payload: Record<string, unknown>) => Promise<unknown>
  removeEventInstance: (id: string) => Promise<unknown>
  logger: AppLogger
}

export type NewEventInstanceData = {
  eventShapeRef: string
  name: string
  titleTemplate: string
  descriptionTemplate: string
  locationTemplate: string
  visibility: 'default' | 'public' | 'private' | 'confidential'
  transparency: 'opaque' | 'transparent'
  guestsCanModify: boolean
  guestsCanInviteOthers: boolean
  guestsCanSeeOtherGuests: boolean
  addConferenceLink: boolean
  sendUpdates: 'all' | 'externalOnly' | 'none'
  colorId: string | null
  status: 'confirmed' | 'tentative'
  /** Create + edit builder: persisted on save (create defaults to true). */
  active: boolean
}
