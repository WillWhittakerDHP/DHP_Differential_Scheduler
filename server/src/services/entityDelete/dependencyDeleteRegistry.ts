import { ENTITY_KEYS } from '../../constants/entities.js'
import type { DependencyDeleteStrategy } from './dependencyDeleteStrategyTypes.js'
import { annotationShapeDependencyDeleteStrategy } from './strategies/annotationShapeDependencyDeleteStrategy.js'
import { blockShapeDependencyDeleteStrategy } from './strategies/blockShapeDependencyDeleteStrategy.js'
import { partShapeDependencyDeleteStrategy } from './strategies/partShapeDependencyDeleteStrategy.js'

const strategies: Record<string, DependencyDeleteStrategy> = {
  [ENTITY_KEYS.PART_SHAPE]: partShapeDependencyDeleteStrategy,
  [ENTITY_KEYS.BLOCK_SHAPE]: blockShapeDependencyDeleteStrategy,
  [ENTITY_KEYS.ANNOTATION_SHAPE]: annotationShapeDependencyDeleteStrategy,
}

export function getDependencyDeleteStrategy(entityType: string): DependencyDeleteStrategy | undefined {
  return strategies[entityType]
}
