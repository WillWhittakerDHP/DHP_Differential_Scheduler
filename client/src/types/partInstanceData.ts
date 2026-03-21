import type { Ref } from 'vue'
import type { GlobalEntity } from '@/types/entities'

export interface UsePartInstanceDataOptions {
  blockInstanceId: Ref<string> | string
}

export interface UsePartInstanceDataReturn {
  validPartShapes: Ref<GlobalEntity<'partShape'>[]>
  existingPartInstances: Ref<GlobalEntity<'partInstance'>[]>

  getPartInstanceForShape: (partShapeId: string) => GlobalEntity<'partInstance'> | undefined
  getPartShapeName: (partShapeId: string) => string
  generatePartInstanceName: (
    blockInstanceName: string,
    partShapeName: string,
    blockInstanceRef: string,
    partShapeRef: string
  ) => string
}
