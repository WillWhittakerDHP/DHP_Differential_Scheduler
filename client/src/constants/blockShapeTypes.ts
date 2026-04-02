
export const BLOCK_SHAPE_TYPES = {
  USER: 'user',
  SERVICE: 'service',
  TIME: 'time',
  EVENT: 'event',
  PRICE: 'price',
} as const

export type BlockShapeType = typeof BLOCK_SHAPE_TYPES[keyof typeof BLOCK_SHAPE_TYPES]
