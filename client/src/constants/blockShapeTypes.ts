
export const BLOCK_SHAPE_TYPES = {
  USER: 'user',
  SERVICE: 'service',
  PROPERTY: 'property',
  OPTION: 'option',
  COUPON: 'coupon'
} as const

export type BlockShapeType = typeof BLOCK_SHAPE_TYPES[keyof typeof BLOCK_SHAPE_TYPES]
