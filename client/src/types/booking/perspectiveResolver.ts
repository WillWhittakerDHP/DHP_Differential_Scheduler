import type { EventShapeEntity } from '@/types/entities'

export interface ResolvedEventShapes {
  majorEventShape: EventShapeEntity | null
  minorEventShape: EventShapeEntity | null
  majorEventName: string | null
  minorEventName: string | null
}
