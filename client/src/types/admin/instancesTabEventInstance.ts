import type { EventInstanceTemplateStrings } from '@/types/admin/eventInstanceTemplateStrings'

export type NewEventInstanceData = EventInstanceTemplateStrings & {
  /** Set when editing a saved segment; omit on create until POST returns (real preview needs this). */
  id?: string
  eventShapeRef: string
  name: string
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
  /** User-type block instance ids invited to this segment via event_instance_attendees. */
  attendees: string[]
  /** Time block instance ids this segment claims via block-scoped event_assignments. */
  eventPartClaims: string[]
}
