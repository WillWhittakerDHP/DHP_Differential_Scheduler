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
  // ✅ IMMUTABLE CORE IDENTIFIERS - Never change during form operations
  id: GlobalEntityId
  entityKey: GE
  
  // Display configuration system
  displayConfig: {
    primitives: Record<GlobalFieldKey<GE>, DisplayFieldType<GE, GlobalFieldKey<GE>>>
    relationships: Record<string, DisplayFieldType<GE, GlobalFieldKey<GE>>>
    layout: Record<GlobalFieldKey<GE>, DisplayFieldType<GE, GlobalFieldKey<GE>>>
  }
  
  // Validation and error handling
  validationErrors?: Record<GlobalFieldKey<GE>, string>
  isDirty?: boolean
  isExpanded?: boolean
  isSelected?: boolean
  
  // ✅ FORM-EDITABLE DATA - Can be modified through forms and UI interactions
  // Using index signature for dynamic properties
  // WHY: Allows dynamic property access for entity properties (orderIndex, disabled, etc.)
  // PATTERN: Index signature enables type-safe property access while allowing dynamic keys
  // NOTE: Includes method return types to satisfy TS2411 - methods are accessed directly, not via index
  [key: string]:
    | ValidAdminValue
    | AdminEntity<GE>['displayConfig']
    | Record<GlobalFieldKey<GE>, string>
    | boolean
    | number
    | undefined
    | (((...args: unknown[]) => unknown))
    | GlobalEntity<GE>
    | void
    | { orderIndex: number; canReorder: boolean }
    | GlobalFieldKey<GE>[]
    | string[]
  
  constructor(admin: GlobalEntity<GE>, displayConfig: AdminEntity<GE>['displayConfig']) {
    // ✅ Set immutable core identifiers first
    this.id = admin.id
    this.entityKey = admin.entityKey as GE
    
    // ✅ Copy all form-editable data using functional approach
    // LEARNING: Copy properties from admin entity to this instance
    // WHY: All entity properties are ValidAdminValue, so we can safely copy them
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
    
    // Set display configs
    this.displayConfig = displayConfig
    
    // Initialize optional properties
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
  // @ts-expect-error - Method signature doesn't match index signature, but methods are accessed directly, not via index
  toPlainObject(formFieldConfig?: FormFieldConfigMap[GE] | Record<string, unknown>): GlobalEntity<GE> {
    let fieldNames: string[] = []
    
    if (formFieldConfig) {
      // Use formFieldConfig to get field names
      fieldNames = Object.keys(formFieldConfig)
    } else {
      // Fall back to displayConfig if available
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
      // ✅ Include immutable identifiers
      id: this.id,
      entityKey: this.entityKey,
      // ✅ Add all form-editable properties (including orderIndex, disabled, and relationship arrays)
      ...formAdmin
    } as GlobalEntity<GE>
  }
  
  // === ORDERING HELPER METHODS ===
  
  /**
   * Get the current order index
   * Returns 0 if not set
   */
  getOrderIndex(): number {
    // LEARNING: Type assertion needed because orderIndex is accessed through index signature
    // WHY: orderIndex is always a number on GlobalEntity, but index signature makes it a union type
    // PATTERN: Assert to number since we know the property type from GlobalEntity definition
    const orderIndex = (this as { orderIndex?: number }).orderIndex
    return orderIndex ?? 0
  }
  
  /**
   * Set the order index
   * Marks entity as dirty for change tracking
   */
  // @ts-expect-error - Method signature doesn't match index signature, but methods are accessed directly, not via index
  setOrderIndex(index: number): void {
    this.orderIndex = index
    this.isDirty = true
  }
  
  /**
   * Get ordering information for UI components
   * Includes order index and reordering capabilities
   */
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
  
  // === TYPE-SAFE PROPERTY ACCESS METHODS ===
  
  /**
   * Type-safe getter for entity fields
   * Provides IntelliSense and compile-time validation
   */
  // @ts-expect-error - Method signature doesn't match index signature, but methods are accessed directly, not via index
  getField<FieldKey extends GlobalFieldKey<GE>>(fieldKey: FieldKey): ValidAdminValue {
    // LEARNING: Type assertion needed because index signature returns union type
    // WHY: fieldKey is constrained to GlobalFieldKey<GE>, so it only accesses entity fields (ValidAdminValue)
    //      but index signature includes displayConfig and validationErrors
    // PATTERN: Assert to ValidAdminValue since fieldKey is a field key, not displayConfig/validationErrors
    return this[fieldKey as string] as ValidAdminValue
  }

  /**
   * Type-safe setter for entity fields
   * Provides IntelliSense and compile-time validation
   */
  // @ts-expect-error - Method signature doesn't match index signature, but methods are accessed directly, not via index
  setField<FieldKey extends GlobalFieldKey<GE>>(fieldKey: FieldKey, value: ValidAdminValue): void {
    this[fieldKey as string] = value
    this.isDirty = true
  }

  /**
   * Type-safe getter for form field values
   * Returns the value with fallback to default
   */
  // @ts-expect-error - Method signature doesn't match index signature, but methods are accessed directly, not via index
  getValidAdminValue<FieldKey extends GlobalFieldKey<GE>>(fieldKey: FieldKey): ValidAdminValue {
    // LEARNING: Type assertion needed because index signature returns union type
    // WHY: fieldKey is constrained to GlobalFieldKey<GE>, so it only accesses entity fields (ValidAdminValue)
    //      but index signature includes displayConfig and validationErrors
    // PATTERN: Assert to ValidAdminValue since fieldKey is a field key, not displayConfig/validationErrors
    const value = this[fieldKey as string] as ValidAdminValue | undefined
    return value !== undefined ? value : this.getDefaultValue(fieldKey)
  }

  /**
   * Type-safe setter for form field values
   * Updates the entity and marks it as dirty
   */
  // @ts-expect-error - Method signature doesn't match index signature, but methods are accessed directly, not via index
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
  // @ts-expect-error - Method signature doesn't match index signature, but methods are accessed directly, not via index
  private getDefaultValue<FieldKey extends GlobalFieldKey<GE>>(_fieldKey: FieldKey): ValidAdminValue {
    // Vue doesn't have globalEntityConfig like React
    // Defaults should be handled during transformation or from adminConfig
    return undefined
  }

  /**
   * Check if a field exists and has a value
   */
  // @ts-expect-error - Method signature doesn't match index signature, but methods are accessed directly, not via index
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
  // @ts-expect-error - Method signature doesn't match index signature, but methods are accessed directly, not via index
  getFieldNames(formFieldConfig?: Record<string, ValidAdminValue>): GlobalFieldKey<GE>[] {
    if (formFieldConfig) {
      // Use formFieldConfig to get field names
      // Filter to only include primitive fields (exclude relationships)
      const allKeys = Object.keys(formFieldConfig)
      const primitiveNames = Object.keys(this.displayConfig?.primitives || {})
      return allKeys.filter(key => primitiveNames.includes(key) || !this.displayConfig?.relationships?.[key]) as GlobalFieldKey<GE>[]
    }
    // Fall back to displayConfig if available
    // Only return primitive field names, not relationships
    const primitiveNames = Object.keys(this.displayConfig?.primitives || {})
    return primitiveNames as GlobalFieldKey<GE>[]
  }
  
  /**
   * Get all relationship property names for this entity type
   * LEARNING: Can use formFieldConfig if displayConfig is empty
   * WHY: Display config is no longer required
   * PATTERN: Use formFieldConfig if provided, otherwise fall back to displayConfig
   */
  // @ts-expect-error - Method signature doesn't match index signature, but methods are accessed directly, not via index
  getRelationshipNames(formFieldConfig?: FormFieldConfigMap[GE] | Record<string, unknown>): string[] {
    if (formFieldConfig) {
      // Filter formFieldConfig to only relationship fields (those with relationshipSelect or typeSelect)
      // LEARNING: Type assertion needed to index formFieldConfig and access FormFieldConfig properties
      // WHY: FormFieldConfig has relationshipSelect/typeSelect properties, but we accept Record<string, unknown> for flexibility
      // PATTERN: Cast to Record<string, unknown> to index, then assert to FormFieldConfig structure
      const configRecord = formFieldConfig as Record<string, unknown>
      return Object.keys(configRecord).filter(key => {
        const fieldConfig = configRecord[key] as { relationshipSelect?: unknown; typeSelect?: unknown } | undefined
        return !!(fieldConfig?.relationshipSelect || fieldConfig?.typeSelect)
      })
    }
    // Fall back to displayConfig if available
    return Object.keys(this.displayConfig?.relationships || {})
  }
}


// === UNIFIED ENTITY MAP ===

export type AdminEntityMap = {
  [GE in GlobalEntityKey]: AdminEntity<GE>[]
}

