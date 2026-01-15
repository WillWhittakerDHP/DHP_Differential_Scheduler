/**
 * GLOBAL DATA FACTORY
 * 
 * Factory functions for generating complete GlobalData objects for testing.
 * Combines entities and relationships into realistic test scenarios.
 */

import type { GlobalData } from '@/utils/transformers/fetchToGlobalTransformer'
import { createBlockInstance, createPartInstance, createBlockShape, createPartShape } from './entityFactory'
import { createActivePartsRel, createActiveComponentsRel } from './relationshipFactory'

/**
 * Create an empty GlobalData object
 */
export function createEmptyGlobalData(): GlobalData {
  return {
    entities: {
      blockInstance: [],
      partInstance: [],
      blockShape: [],
      partShape: [],
    },
    relationships: {
      activeParts: [],
      bookingCascades: [],
      instanceComponents: [],
      validCascades: [],
      validParts: [],
      dependentInstanceOptions: [],
    },
  }
}

/**
 * Create GlobalData with a single atomic block (no components)
 */
export function createAtomicBlockGlobalData() {
  const blockShape = createBlockShape('shape-1', 'Base Service')
  const partShape1 = createPartShape('part-shape-1', 'Interior')
  const partShape2 = createPartShape('part-shape-2', 'Exterior')
  
  const partInstance1 = createPartInstance('part-1', 'Interior Inspection', {
    partShapeRef: partShape1.id,
    baseTime: 60,
    baseFee: 100,
    onSite: true,
    clientPresent: true,
    orderIndex: 1,
  })
  
  const partInstance2 = createPartInstance('part-2', 'Exterior Inspection', {
    partShapeRef: partShape2.id,
    baseTime: 45,
    baseFee: 75,
    onSite: true,
    clientPresent: false,
    orderIndex: 2,
  })
  
  const blockInstance = createBlockInstance('block-1', 'Standard Inspection', {
    blockShapeRef: blockShape.id,
    baseSqFt: 2000,
    orderIndex: 1,
    differential: false,
  })
  
  return {
    entities: {
      blockInstance: [blockInstance],
      partInstance: [partInstance1, partInstance2],
      blockShape: [blockShape],
      partShape: [partShape1, partShape2],
    },
    relationships: {
      activeParts: [
        createActivePartsRel(blockInstance.id, [partInstance1.id, partInstance2.id]),
      ],
      bookingCascades: [],
      instanceComponents: [],
      validCascades: [],
      validParts: [],
      dependentInstanceOptions: [],
    },
  }
}

/**
 * Create GlobalData with a composite block (with components)
 */
export function createCompositeBlockGlobalData() {
  // Shapes
  const compositeShape = createBlockShape('composite-shape', 'Full Inspection')
  const component1Shape = createBlockShape('component1-shape', 'Interior Service')
  const component2Shape = createBlockShape('component2-shape', 'Exterior Service')
  
  const partShape1 = createPartShape('part-shape-1', 'Room Check')
  const partShape2 = createPartShape('part-shape-2', 'Roof Check')
  const partShape3 = createPartShape('part-shape-3', 'Foundation Check')
  
  // Component parts
  const part1 = createPartInstance('part-1', 'Room Inspection', {
    partShapeRef: partShape1.id,
    baseTime: 30,
    baseFee: 50,
    orderIndex: 1,
  })
  
  const part2 = createPartInstance('part-2', 'Roof Inspection', {
    partShapeRef: partShape2.id,
    baseTime: 45,
    baseFee: 75,
    orderIndex: 2,
  })
  
  const part3 = createPartInstance('part-3', 'Foundation Inspection', {
    partShapeRef: partShape3.id,
    baseTime: 30,
    baseFee: 60,
    orderIndex: 3,
  })
  
  // Components
  const component1 = createBlockInstance('component-1', 'Interior Service', {
    blockShapeRef: component1Shape.id,
    orderIndex: 1,
  })
  
  const component2 = createBlockInstance('component-2', 'Exterior Service', {
    blockShapeRef: component2Shape.id,
    orderIndex: 2,
  })
  
  // Composite block
  const composite = createBlockInstance('composite-1', 'Full Inspection Package', {
    blockShapeRef: compositeShape.id,
    composite: true,
    orderIndex: 1,
  })
  
  return {
    entities: {
      blockInstance: [composite, component1, component2],
      partInstance: [part1, part2, part3],
      blockShape: [compositeShape, component1Shape, component2Shape],
      partShape: [partShape1, partShape2, partShape3],
    },
    relationships: {
      activeParts: [
        createActivePartsRel(component1.id, [part1.id]),
        createActivePartsRel(component2.id, [part2.id, part3.id]),
      ],
      bookingCascades: [],
      instanceComponents: [
        createActiveComponentsRel(composite.id, [component1.id, component2.id]),
      ],
      validCascades: [],
      validParts: [],
      dependentInstanceOptions: [],
    },
  }
}

/**
 * Create GlobalData with multiple independent blocks
 */
export function createMultipleBlocksGlobalData(count: number = 3) {
  const blockShape = createBlockShape('shape-1', 'Service')
  const partShape = createPartShape('part-shape-1', 'Task')
  
  const blockInstances = Array.from({ length: count }, (_, i) => {
    return createBlockInstance(`block-${i + 1}`, `Service ${i + 1}`, {
      blockShapeRef: blockShape.id,
      orderIndex: i + 1,
    })
  })
  
  const partInstances = Array.from({ length: count }, (_, i) => {
    return createPartInstance(`part-${i + 1}`, `Task ${i + 1}`, {
      partShapeRef: partShape.id,
      baseTime: 30 + (i * 15),
      baseFee: 50 + (i * 25),
      orderIndex: i + 1,
    })
  })
  
  const activeParts = blockInstances.map((block, i) =>
    createActivePartsRel(block.id, [partInstances[i].id])
  )
  
  return {
    entities: {
      blockInstance: blockInstances,
      partInstance: partInstances,
      blockShape: [blockShape],
      partShape: [partShape],
    },
    relationships: {
      activeParts,
      bookingCascades: [],
      instanceComponents: [],
      validCascades: [],
      validParts: [],
      dependentInstanceOptions: [],
    },
  }
}

/**
 * Create GlobalData with disabled entities for testing filters
 */
export function createGlobalDataWithDisabledEntities() {
  const blockShape = createBlockShape('shape-1', 'Service')
  const partShape = createPartShape('part-shape-1', 'Task')
  
  const enabledBlock = createBlockInstance('block-enabled', 'Enabled Service', {
    blockShapeRef: blockShape.id,
    disabled: false,
    orderIndex: 1,
  })
  
  const disabledBlock = createBlockInstance('block-disabled', 'Disabled Service', {
    blockShapeRef: blockShape.id,
    disabled: true,
    orderIndex: 2,
  })
  
  const enabledPart = createPartInstance('part-enabled', 'Enabled Task', {
    partShapeRef: partShape.id,
    disabled: false,
    baseTime: 30,
    orderIndex: 1,
  })
  
  const disabledPart = createPartInstance('part-disabled', 'Disabled Task', {
    partShapeRef: partShape.id,
    disabled: true,
    baseTime: 30,
    orderIndex: 2,
  })
  
  return {
    entities: {
      blockInstance: [enabledBlock, disabledBlock],
      partInstance: [enabledPart, disabledPart],
      blockShape: [blockShape],
      partShape: [partShape],
    },
    relationships: {
      activeParts: [
        createActivePartsRel(enabledBlock.id, [enabledPart.id, disabledPart.id]),
        createActivePartsRel(disabledBlock.id, [enabledPart.id]),
      ],
      bookingCascades: [],
      instanceComponents: [],
      validCascades: [],
      validParts: [],
      dependentInstanceOptions: [],
    },
  }
}

