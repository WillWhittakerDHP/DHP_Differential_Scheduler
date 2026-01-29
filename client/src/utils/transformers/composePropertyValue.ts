/**
 * Compose Property Value Types and Utilities
 *
 * LEARNING: Our component-composition strategies only operate on a narrow set of "composable" value shapes.
 * WHY: `composeProperty()` is intentionally limited (sum/merge/every/first) and should not accept arbitrary objects.
 * PATTERN: Use a shared type + type guard to keep call sites type-safe without unsafe casts.
 */

import type { ComponentStrategy } from '@/types/component'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import { COMPONENT_STRATEGIES } from '@/constants/component'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import { findById } from '@/utils/collections/findById'

export type ComposablePropertyValue = string | number | boolean | unknown[]

export function isComposablePropertyValue(value: unknown): value is ComposablePropertyValue {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    Array.isArray(value)
  )
}

/**
 * Compose a single property using the specified strategy
 * 
 * LEARNING: Different properties need different component strategies
 * WHY: Numeric values sum, arrays merge, booleans use AND, strings use first
 * PATTERN: Strategy pattern for property component
 * 
 * @param values - Array of property values from components
 * @param strategy - Component strategy to use
 * @returns Composed value
 */
export function composeProperty<T extends string | number | boolean | unknown[]>(
  values: T[],
  strategy: ComponentStrategy
): T | T[] | number | boolean | undefined {
  if (values.length === 0) {
    return undefined
  }
  
  switch (strategy) {
    case COMPONENT_STRATEGIES.SUM:
      // Sum numeric values
      return values.reduce((sum, val) => {
        const num = typeof val === 'number' ? val : 0
        return sum + num
      }, 0) as number
    
    case COMPONENT_STRATEGIES.MERGE: {
      // Merge arrays (flatten and deduplicate)
      const merged = values.flat().filter((val, index, arr) => arr.indexOf(val) === index)
      return merged as T[]
    }
    
    case COMPONENT_STRATEGIES.FIRST:
      // Use first non-undefined value
      return values.find(val => val !== undefined && val !== null) ?? values[0]
    
    case COMPONENT_STRATEGIES.EVERY:
      // Boolean AND - all must be true
      return values.every(val => Boolean(val)) as boolean
    
    case COMPONENT_STRATEGIES.CUSTOM:
      // Custom component (not implemented yet)
      return values[0]
    
    default:
      return values[0]
  }
}

/**
 * Compose properties from component entities
 * 
 * LEARNING: Shared logic for composing properties from components
 * WHY: DRY - this logic is duplicated between componentAggregator and relationshipTransformers
 * PATTERN: Extract property composition logic into shared utility
 * 
 * @param components - Array of component entities
 * @param entityKind - Entity type key
 * @param componentRules - Component strategy rules per property
 * @param blockShapes - Array of blockShape entities (for baseSqFt filtering)
 * @returns Partial entity with composed properties
 */
export function composePropertiesFromComponents<GE extends GlobalEntityKey>(
  components: GlobalEntity<GE>[],
  entityKind: GE,
  componentRules: Record<string, ComponentStrategy>,
  blockShapes?: GlobalEntity<GlobalEntityKey>[]
): Partial<GlobalEntity<GE>> {
  if (components.length === 0) {
    return {}
  }

  // Get all property keys from components using functional approach
  const propertyKeys = new Set(
    components.flatMap(component =>
      Object.keys(component).filter(key =>
        key !== 'id' && key !== 'entityKey' && key !== 'instanceComponents' && key !== 'isComposer'
      )
    )
  )

  // Compose properties using functional approach
  const composed = Array.from(propertyKeys).reduce((acc, propertyKey) => {
    const strategy = componentRules[propertyKey] || 'first'
    
    // LEARNING: Filter out baseSqFt from state control blockInstances when summing
    // WHY: State control blockShapes (constituable: false) should not contribute to square footage accumulation
    // PATTERN: For baseSqFt sum operations on blockInstance, exclude components with constituable: false blockShapes
    let values: unknown[]
    if (propertyKey === 'baseSqFt' && entityKind === 'blockInstance' && strategy === COMPONENT_STRATEGIES.SUM && blockShapes) {
      // Filter components to exclude those with constituable: false blockShapes (state control mode)
      const filteredComponents = components.filter(component => {
        const blockInstance = component as GlobalEntity<'blockInstance'>
        const blockShapeRef = getEntityFieldValue(blockInstance, 'blockShapeRef')
        if (!blockShapeRef) return true // Include if no blockShapeRef (shouldn't happen, but safe)
        
        const blockShape = findById(blockShapes, String(blockShapeRef)) as GlobalEntity<'blockShape'> | undefined
        if (!blockShape) {
          return true // Preserve previous behavior: include component if blockShape missing
        }
        if (blockShape.entityKey !== 'blockShape') return true // Defensive: ensure correct narrowing
        
        const blockShapeTyped = blockShape as GlobalEntity<'blockShape'> & { constituable?: boolean }
        const constituable = blockShapeTyped.constituable === true
        
        // LEARNING: Exclude if constituable is false (state control mode)
        // WHY: State control blockShapes don't contribute to baseSqFt accumulation
        // PATTERN: Check constituable property (inverted from previous stateControlOnly check)
        return constituable
      })
      
      values = filteredComponents
        .map((component) => (component as Partial<GlobalEntity<GE>>)[propertyKey as keyof GlobalEntity<GE>])
        .filter((val) => val !== undefined)
    } else {
      values = components
        .map((component) => (component as Partial<GlobalEntity<GE>>)[propertyKey as keyof GlobalEntity<GE>])
        .filter((val) => val !== undefined)
    }
    
    const composableValues = values.filter(isComposablePropertyValue)
    if (composableValues.length > 0) {
      acc[propertyKey] = composeProperty(composableValues, strategy)
    }
    return acc
  }, {} as Record<string, unknown>)
  
  return composed as Partial<GlobalEntity<GE>>
}


