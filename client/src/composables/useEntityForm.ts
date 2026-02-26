/**
 * PATTERN: Entity Form Composable

PATTERN: Composable that manages entity form sta...
 */
import { computed } from 'vue'
import type { UseEntityFormOptions, UseEntityFormReturn } from '@/types/entityForm'


/**
 * PATTERN: Entity Form Composable

PATTERN: Composable with computed properties for...
 */
export function useEntityForm(options: UseEntityFormOptions): UseEntityFormReturn {
  const {
    form,
    entity: entityOption
  } = options
  
  const entity = 'value' in entityOption ? entityOption : computed(() => entityOption)
  
  const canSave = computed(() => {
    return form.meta.value.valid && form.meta.value.dirty
  })
  
  const hasChanges = computed(() => {
    return form.meta.value.dirty
  })
  
  const validate = async (): Promise<boolean> => {
    const { valid } = await form.validate()
    return valid
  }
  
  const save = async (): Promise<void> => {
    const isValid = await validate()
    if (!isValid) {
      throw new Error('Form validation failed')
    }
  }
  
  const reset = (): void => {
    const val = entity.value
    form.resetForm({
      values: typeof val === 'object' && val !== null ? { ...val } : {},
    })
  }
  
  return {
    canSave,
    hasChanges,
    save,
    reset,
    validate
  }
}

