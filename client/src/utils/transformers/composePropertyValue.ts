import type { ComponentStrategy } from '@shared/types/componentTypes'
import type { GlobalEntity } from '@/types/entities'
import type { GlobalEntityKey } from '@/constants/entities'
import { COMPONENT_STRATEGIES } from '@/constants/component'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'

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
 * PATTERN: Compose a single property using the specified strategy

PATTERN: Strateg...
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

export function composePropertiesFromComponents<GE extends GlobalEntityKey>(
  components: GlobalEntity<GE>[],
  _entityKind: GE,
  _blockShapes?: GlobalEntity<GlobalEntityKey>[]
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
    
    const composedValue = composeProperty(composableValues, strategy)
    if (composedValue !== undefined) {
      acc[propertyKey] = composedValue
    }
    return acc
  }, {} as Record<string, unknown>)
  
  return composed as Partial<GlobalEntity<GE>>
}
