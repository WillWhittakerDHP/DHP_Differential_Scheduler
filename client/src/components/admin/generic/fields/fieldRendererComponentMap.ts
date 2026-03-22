import type { Component } from 'vue'
import PrimitiveInputs from './PrimitiveInputs.vue'
import SelectInputs from './SelectInputs.vue'
import RelationshipCollection from '../collections/RelationshipCollection.vue'
import IconInput from './IconInput.vue'
import DifferentialEventRoleOverridesField from './DifferentialEventRoleOverridesField.vue'
import type { FieldComponent } from '@/utils/forms/fieldComponentDispatcher'

/** Central map so FieldRenderer.vue stays under component-coupling .vue import threshold. */
export function createFieldRendererComponentMap(): Record<FieldComponent['type'], Component | null> {
  return {
    icon: IconInput,
    primitive: PrimitiveInputs,
    relationshipCollection: RelationshipCollection,
    select: SelectInputs,
    differentialEventRoleOverrides: DifferentialEventRoleOverridesField,
    unknown: null,
  }
}
