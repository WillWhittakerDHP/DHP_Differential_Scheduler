import { ENTITY_KEYS } from '../../constants/entities.js'
import type { DependencyDeleteStrategy } from './dependencyDeleteStrategyTypes.js'
import { partShapeDependencyDeleteStrategy } from './strategies/partShapeDependencyDeleteStrategy.js'

const strategies: Record<string, DependencyDeleteStrategy> = {
  [ENTITY_KEYS.PART_SHAPE]: partShapeDependencyDeleteStrategy,
}

export function getDependencyDeleteStrategy(entityType: string): DependencyDeleteStrategy | undefined {
  return strategies[entityType]
}
