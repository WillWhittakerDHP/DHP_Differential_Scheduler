/**
 * Admin Entity Class
 * 
 * LEARNING: Provides validation, default values, and type-safe property access
 * WHY: Validates entity structure and ensures all properties exist with defaults
 * PATTERN: Class-based entity with validation methods, converted to plain object for Vue
 * COMPARISON: React uses AdminEntity instances. Vue uses AdminEntity temporarily, then converts to plain object.
 */

import type { GlobalEntityKey } from '@/constants/entities'
import type { GlobalFieldKey, ValidAdminValue } from '@/constants/primitives'
import type { GlobalEntityId, GlobalEntity } from '@/types/entities'
import type { DisplayFieldType } from '@/configs/field/display/fullFieldDisplayConfig'
import type { FormFieldConfigMap } from '@/types/entity/formFields'

export class AdminEntity<GE extends GlobalEntityKey> {
  id: GlobalEntityId
  entityKey: GE
  
  displayConfig: {
    primitives: Record<GlobalFieldKey<GE>, DisplayFieldType<GE, GlobalFieldKey<GE>>>
    relationships: Record<string, DisplayFieldType<GE, GlobalFieldKey<GE>>>
    layout: Record<GlobalFieldKey<GE>, DisplayFieldType<GE, GlobalFieldKey<GE>>>
  }
  
  validationErrors?: Record<GlobalFieldKey<GE>, string>
  isDirty?: boolean
  isExpanded?: boolean
  isSelected?: boolean
  
  // PATTERN: Index signature enables type-safe property access while allowing dynamic keys
  // Note: Methods are implemented separately and TypeScript should exclude them, but we use 'any' for the function type
  // to avoid conflicts with specific method signatures
  [key: string]: unknown
  
  constructor(admin: GlobalEntity<GE>, displayConfig: AdminEntity<GE>['displayConfig']) {
    this.id = admin.id
    this.entityKey = admin.entityKey as GE
    
    // PATTERN: Use Object.assign with Object.fromEntries for functional property copying
    const filteredKeys = Object.keys(admin)
      .filter((key) => key !== 'id' && key !== 'entityKey') as Array<
      Exclude<keyof GlobalEntity<GE>, 'id' | 'entityKey'>
    >
    Object.assign(
      this,
      Object.fromEntries(
        filteredKeys.map((key) => [key, admin[key] as ValidAdminValue])
      )
    )
    
    this.displayConfig = displayConfig
    
    this.isDirty = false
    this.isExpanded = false
    this.isSelected = false
  }
  
  /**
   * Convert to plain object for serialization
   * Returns all properties (immutable + form-editable) for Vue reactivity
   * LEARNING: Can use formFieldConfig if displayConfig is empty
   * WHY: Display config is no longer required for transformation
   * PATTERN: Use formFieldConfig if provided, otherwise fall back to displayConfig
   * NOTE: formFieldConfig is only used to get property names (via Object.keys), not values
   *       So we accept any object-like type since we only need the keys
   */
  toPlainObject(formFieldConfig?: FormFieldConfigMap[GE] | Record<string, unknown>): GlobalEntity<GE> {
    let fieldNames: string[] = []
    
    if (formFieldConfig) {
      fieldNames = Object.keys(formFieldConfig)
    } else {
      const primitiveNames = Object.keys(this.displayConfig?.primitives || {})
      const relationshipNames = Object.keys(this.displayConfig?.relationships || {})
      fieldNames = [...primitiveNames, ...relationshipNames]
    }
    
    /**
     * WHY: // WHY: fieldNames contains entity field keys (from formFieldConfig or displayConfig),
     * PATTERN: // PATTERN: Assert to ValidAdminValue since these are field keys, not internal class properties
     */
    const formAdmin = fieldNames.reduce((acc, fieldKey) => {
      acc[fieldKey] = this[fieldKey] as ValidAdminValue
      return acc
    }, {} as Record<string, ValidAdminValue>)
    
    return {
      id: this.id,
      entityKey: this.entityKey,
      ...formAdmin
    } as GlobalEntity<GE>
  }
  
  
  getOrderIndex(): number {
    // LEARNING: Type assertion needed because orderIndex is accessed through index signature
    // PATTERN: Assert to number since we know the property type from GlobalEntity definition
    const orderIndex = (this as { orderIndex?: number }).orderIndex
    return orderIndex ?? 0
  }
  
  setOrderIndex(index: number): void {
    this.orderIndex = index
    this.isDirty = true
  }
  
  getOrderingInfo(): { orderIndex: number; canReorder: boolean } {
    return {
      orderIndex: this.getOrderIndex(),
      canReorder: !this.disabled
    }
  }
  
  /**
   * Check if this entity can be reordered
   * Based on disabled state and other constraints
   */
  canReorder(): boolean {
    return !this.disabled
  }
  
  
  getField<FieldKey extends GlobalFieldKey<GE>>(fieldKey: FieldKey): ValidAdminValue {
    // LEARNING: Type assertion needed because index signature returns union type
    // PATTERN: Assert to ValidAdminValue since fieldKey is a field key, not displayConfig/validationErrors
    return this[fieldKey as string] as ValidAdminValue
  }

  setField<FieldKey extends GlobalFieldKey<GE>>(fieldKey: FieldKey, value: ValidAdminValue): void {
    this[fieldKey as string] = value
    this.isDirty = true
  }

  getValidAdminValue<FieldKey extends GlobalFieldKey<GE>>(fieldKey: FieldKey): ValidAdminValue {
    // LEARNING: Type assertion needed because index signature returns union type
    // PATTERN: Assert to ValidAdminValue since fieldKey is a field key, not displayConfig/validationErrors
    const value = this[fieldKey as string] as ValidAdminValue | undefined
    return value !== undefined ? value : this.getDefaultValue(fieldKey)
  }

  setValidAdminValue<FieldKey extends GlobalFieldKey<GE>>(fieldKey: FieldKey, value: ValidAdminValue): void {
    this[fieldKey as string] = value
    this.isDirty = true
  }

  /**
   * Get default value for a field
   * LEARNING: In Vue, we don't have globalEntityConfig, so return undefined
   * WHY: Defaults should come from adminConfig or be handled at transformation time
   * PATTERN: Return undefined if no default available
   */
  private getDefaultValue<FieldKey extends GlobalFieldKey<GE>>(_fieldKey: FieldKey): ValidAdminValue {
    return undefined
  }

  hasField<FieldKey extends GlobalFieldKey<GE>>(fieldKey: FieldKey): boolean {
    const value = this[fieldKey as string]
    return value !== undefined && value !== null
  }
  
  /**
   * Get all field names for this entity type
   * Returns only primitive field names (not relationships)
   * LEARNING: Can use formFieldConfig if displayConfig is empty
   * WHY: Display config is no longer required for validation
   * PATTERN: Use formFieldConfig if provided, otherwise fall back to displayConfig
   * NOTE: Relationships are not part of GlobalFieldKey, so they are excluded
   */
  getFieldNames(formFieldConfig?: Record<string, ValidAdminValue>): GlobalFieldKey<GE>[] {
    if (formFieldConfig) {
      const allKeys = Object.keys(formFieldConfig)
      const primitiveNames = Object.keys(this.displayConfig?.primitives || {})
      return allKeys.filter(key => primitiveNames.includes(key) || !this.displayConfig?.relationships?.[key]) as GlobalFieldKey<GE>[]
    }
    const primitiveNames = Object.keys(this.displayConfig?.primitives || {})
    return primitiveNames as GlobalFieldKey<GE>[]
  }
  
  /**
   * Get all relationship property names for this entity type
   * LEARNING: Can use formFieldConfig if displayConfig is empty
   * WHY: Display config is no longer required
   * PATTERN: Use formFieldConfig if provided, otherwise fall back to displayConfig
   */
  getRelationshipNames(formFieldConfig?: FormFieldConfigMap[GE] | Record<string, unknown>): string[] {
    if (formFieldConfig) {
      // PATTERN: Cast to Record<string, unknown> to index, then assert to FormFieldConfig structure
      const configRecord = formFieldConfig as Record<string, unknown>
      return Object.keys(configRecord).filter(key => {
        const fieldConfig = configRecord[key] as { relationshipSelect?: unknown; typeSelect?: unknown } | undefined
        return !!(fieldConfig?.relationshipSelect || fieldConfig?.typeSelect)
      })
    }
    return Object.keys(this.displayConfig?.relationships || {})
  }
}



export type AdminEntityMap = {
  [GE in GlobalEntityKey]: AdminEntity<GE>[]
}

