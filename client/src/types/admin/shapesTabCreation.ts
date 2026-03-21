import type { AppLogger } from '@/utils/logger'
import type { ShapesTabBaseParams } from './shapesTabDeletion'

export interface UseShapesTabCreationParams extends ShapesTabBaseParams {
  success: (message: string) => void
  createAnnotationShapeMutation: (payload: Record<string, unknown>) => Promise<unknown>
  createEventShapeMutation: (payload: Record<string, unknown>) => Promise<unknown>
  logger: AppLogger
}
