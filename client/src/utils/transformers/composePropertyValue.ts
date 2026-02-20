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
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import { getEntityFieldValue } from '@/utils/entities/entityFieldAccess'
import { findById } from '@/utils/collections/findById'

type ComposablePropertyValue = string | number | boolean | unknown[]

function isComposablePropertyValue(value: unknown): value is ComposablePropertyValue {
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
function composeProperty<T extends string | number | boolean | unknown[]>(
  values: T[],
  strategy: ComponentStrategy
): T | T[] | number | boolean | undefined {
  if (values.length === 0) {
    return undefined
  }
  
  switch (strategy) {
    case COMPONENT_STRATEGIES.SUM:
      return values.reduce((sum, val) => {
        const num = typeof val === 'number' ? val : 0
        return sum + num
      }, 0) as number
    
    case COMPONENT_STRATEGIES.MERGE: {
      const merged = values.flat().filter((val, index, arr) => arr.indexOf(val) === index)
      return merged as T[]
    }
    
    case COMPONENT_STRATEGIES.FIRST:
      return values.find(val => val !== undefined && val !== null) ?? values[0]
    
    case COMPONENT_STRATEGIES.EVERY:
      return values.every(val => Boolean(val)) as boolean
    
    case COMPONENT_STRATEGIES.CUSTOM:
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
 * @param blockShapes - Array of blockShape entities (for baseSqFt filtering)
 * @returns Partial entity with composed properties
 */
export function composePropertiesFromComponents<GE extends GlobalEntityKey>(
  components: GlobalEntity<GE>[],
  entityKind: GE,
  blockShapes?: GlobalEntity<GlobalEntityKey>[]
): Partial<GlobalEntity<GE>> {
  if (components.length === 0) {
    return {}
  }

  const propertyKeys = new Set(
    components.flatMap(component =>
      Object.keys(component).filter(key =>
        key !== 'id' && key !== FIELD_NAMES.ENTITY_KEY && key !== 'instanceComponents' && key !== 'isComposer'
      )
    )
  )

  const composed = Array.from(propertyKeys).reduce((acc, propertyKey) => {
    let values: unknown[] = components
      .map((component) => (component as Record<string, unknown>)[String(propertyKey)])
      .filter((val) => val !== undefined)
    
    const composableValues = values.filter(isComposablePropertyValue)
    if (composableValues.length === 0) {
      return acc
    }
    
    // LEARNING: Strategy determined from actual value types, not configuration
    // PATTERN: Check value type to determine appropriate composition strategy
    const firstValue = composableValues[0]
    let strategy: ComponentStrategy
    if (Array.isArray(firstValue)) {
      strategy = 'merge'
    } else if (typeof firstValue === 'boolean') {
      strategy = 'every'
    } else if (typeof firstValue === 'number') {
      strategy = 'sum'
    } else {
      strategy = 'first'
    }
    
    // LEARNING: Filter out baseSqFt from state control blockInstances when summing
    // WHY: State control blockShapes (isStateControl: true) should not contribute to square footage accumulation
    // PATTERN: For baseSqFt sum operations on blockInstance, exclude components with isStateControl: true blockShapes
    if (propertyKey === 'baseSqFt' && entityKind === 'blockInstance' && strategy === COMPONENT_STRATEGIES.SUM && blockShapes) {
      const filteredComponents = components.filter(component => {
        const blockInstance = component as GlobalEntity<'blockInstance'>
        const blockShapeRef = getEntityFieldValue(blockInstance, 'blockShapeRef')
        if (!blockShapeRef) return true // Include if no blockShapeRef (shouldn't happen, but safe)
        
        const blockShape = findById(blockShapes, String(blockShapeRef)) as GlobalEntity<'blockShape'> | undefined
        if (!blockShape) {
          return true // Preserve previous behavior: include component if blockShape missing
        }
        if (blockShape.entityKey !== 'blockShape') return true // Defensive: ensure correct narrowing
        
        const blockShapeTyped = blockShape as GlobalEntity<'blockShape'> & { isStateControl?: boolean }
        const isStateControl = blockShapeTyped.isStateControl === true
        
        // LEARNING: Exclude if isStateControl is true (state control mode)
        // WHY: State control blockShapes don't contribute to baseSqFt accumulation
        // PATTERN: Check isStateControl property
        return !isStateControl
      })
      
      values = filteredComponents
        .map((component) => (component as Record<string, unknown>)[String(propertyKey)])
        .filter((val) => val !== undefined)
      
      const filteredComposableValues = values.filter(isComposablePropertyValue)
      if (filteredComposableValues.length > 0) {
        acc[propertyKey] = composeProperty(filteredComposableValues, strategy)
      }
    } else {
      acc[propertyKey] = composeProperty(composableValues, strategy)
    }
    return acc
  }, {} as Record<string, unknown>)
  
  return composed as Partial<GlobalEntity<GE>>
}


