/**
 * WHY: Map one property-type block instance to selection-card row + optional components (audit: shrink composable).
 */

import type { GlobalEntityId } from '@shared/types/primitiveBrands'
import type { BookingBlockInstance } from '@/types/transformers/bookingData'
import type { GlobalEntity } from '@/types/entities'
import type { ComponentItem, SelectionCardItemWithComponents } from '@/types/booking/propertyDetailsLogic'
import { toGlobalEntityId } from '@/utils/globalEntity'
import { extractInstanceComponents } from '@/utils/instanceComponentUtils'
import { isBookingBlockInstanceComposable } from '@/utils/booking/blockInstanceComposable'

export interface PropertyTypeBlockListContext {
  getGlobalData: () => unknown | null
  getGlobalEntityById: (
    entityKey: 'blockInstance' | 'blockShape',
    id: string
  ) => GlobalEntity<'blockInstance'> | GlobalEntity<'blockShape'> | null
  getInstanceComponentRelationships: (globalId: GlobalEntityId) => unknown[] | null | undefined
}

function adaptGetGlobalEntityById(
  ctx: PropertyTypeBlockListContext
): (
  entityKey: 'blockInstance' | 'blockShape',
  id: string
) => GlobalEntity<'blockInstance'> | null | GlobalEntity<'blockShape'> | null {
  return (entityKey: 'blockInstance' | 'blockShape', id: string) => {
    const entity = ctx.getGlobalEntityById(entityKey, id)
    if (entityKey === 'blockInstance') {
      return entity as GlobalEntity<'blockInstance'> | null
    }
    return entity as GlobalEntity<'blockShape'> | null
  }
}

function extractInstanceComponentsForComposable(
  adjustment: BookingBlockInstance,
  ctx: PropertyTypeBlockListContext
): ComponentItem[] {
  const instanceComponentsRelationships = ctx.getInstanceComponentRelationships(
    toGlobalEntityId(adjustment.id)
  )
  if (!instanceComponentsRelationships || instanceComponentsRelationships.length === 0) {
    return []
  }
  return extractInstanceComponents({
    serviceId: adjustment.id,
    instanceComponentsRelationships: instanceComponentsRelationships as Array<{ childId: string }>,
    getGlobalEntityById: adaptGetGlobalEntityById(ctx),
  })
}

export function mapPropertyTypeBlockToListItem(
  adjustment: BookingBlockInstance,
  ctx: PropertyTypeBlockListContext
): SelectionCardItemWithComponents {
  const isComposable = isBookingBlockInstanceComposable(
    adjustment,
    ctx.getGlobalData,
    (entityKey, id) => ctx.getGlobalEntityById(entityKey, id)
  )

  const instanceComponents = isComposable ? extractInstanceComponentsForComposable(adjustment, ctx) : []

  return {
    ...adjustment,
    composite: isComposable,
    instanceComponents: instanceComponents.length > 0 ? instanceComponents : undefined,
  }
}
