import type { Ref } from 'vue'

/** Base params shared by shapes tab composables (e.g. creation, deletion). */
export interface ShapesTabBaseParams {
  expandedShapes: Ref<string[]>
}
