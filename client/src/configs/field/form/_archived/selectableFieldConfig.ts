/**
 * LEARNING: Selectable Field Config Builder
 * WHY: Defines which fields are selectable (relationship or type selects)
 * PATTERN: Configures relationship and type select fields for each entity
 */

import type { GlobalEntityKey } from '@/constants/entities'
import { ENTITY_KEY_BLOCK_INSTANCE, ENTITY_KEY_BLOCK_SHAPE, ENTITY_KEY_PART_INSTANCE, ENTITY_KEY_PART_SHAPE } from '@/constants/entities'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import type { RelationshipFieldType, VirtualFieldType } from '@/types/entity/formFields'
import { RelationshipSelectTypeEnum, RelationshipSelectModeEnum, TypeSelectEnum } from '@/types/entity/formDataEnums'

export type { RelationshipFieldType, VirtualFieldType }

export type SelectableFieldType<
  GE extends GlobalEntityKey = GlobalEntityKey
> =
  | RelationshipFieldType<GE, GlobalRelationshipKey>
  | VirtualFieldType<GE>;
  
type SelectableFieldKey<GE extends GlobalEntityKey> = GlobalFieldKey<GE>;

export type SelectableFieldTypeSuite = {
  [GE in GlobalEntityKey]: Partial<Record<SelectableFieldKey<GE> | string, SelectableFieldType<GE>>>;
};

export function buildSelectableFieldType(): SelectableFieldTypeSuite {
  return {
    [ENTITY_KEY_BLOCK_INSTANCE]: {
      blockShapeRef: {
        targetMode: "property",
        targetKey: ENTITY_KEY_BLOCK_SHAPE,
        globalField: "blockShapeRef",

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: ENTITY_KEY_BLOCK_SHAPE,
        selectedChildPath: ["blockShapeRef"], 

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE, 
        candidateParentPath: [],        
        candidateChildKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateChildPath: [],         

        selectType: TypeSelectEnum.BlockShape,
        selectMode: RelationshipSelectModeEnum.Required,
        placeholder: "Select a block shape",
      },

      bookingCascades: {
        targetMode: "relationship",
        targetKey: "bookingCascades",
        globalField: "bookingCascades" as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_INSTANCE>,

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildPath: ["bookingCascades"] as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_INSTANCE>[],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateParentPath: ["blockShapeRef"],             
        candidateChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateChildPath: [],                         

        selectType: RelationshipSelectTypeEnum.BookingCascadeSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        groupByKey: "blockShapeRef", // LEARNING: groupByKey must be a field key, not an entity key
        placeholder: "Which block instances are children of this block instance?",
      },
            
      partAssignments: {
        targetMode: "relationship",
        targetKey: "partAssignments",
        globalField: "partAssignments" as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_INSTANCE>,

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: ENTITY_KEY_PART_INSTANCE,
        selectedChildPath: ["partAssignments"] as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_INSTANCE>[],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,                 
        candidateParentPath: ["blockShapeRef"],             
        candidateChildKey: ENTITY_KEY_PART_INSTANCE,
        candidateChildPath: [],                          

        selectType: RelationshipSelectTypeEnum.PartAssignmentSelect,
        selectMode: RelationshipSelectModeEnum.Nested,
        placeholder: "Which part instances are used by this block instance?",
      },

      dependentInstances: {
        targetMode: "relationship",
        targetKey: "dependentInstances",
        globalField: "dependentInstances" as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_INSTANCE>,

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildPath: ["dependentInstances"] as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_INSTANCE>[],

        candidateParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateParentPath: ["blockShapeRef"], // LEARNING: Filter candidates by current blockInstance's blockShapeRef
        candidateChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateChildPath: ["blockShapeRef"], // Filter child candidates by matching blockShapeRef

        selectType: RelationshipSelectTypeEnum.DependentInstanceSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        placeholder: "Which block instances are valid as dependent instances?",
      },

      instanceComponents: {
        targetMode: "relationship",
        targetKey: "instanceComponents",
        globalField: "instanceComponents",

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildPath: ["instanceComponents"],

        candidateParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateParentPath: ["blockShapeRef"], // LEARNING: Always filter by blockShapeRef, not dependentInstances
        candidateChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateChildPath: ["blockShapeRef"], // Filter child candidates by matching blockShapeRef

        selectType: RelationshipSelectTypeEnum.InstanceComponentSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        placeholder: "Select service components...",
      },

      annotations: {
        targetMode: "relationship",
        targetKey: "annotationAssignments" as GlobalRelationshipKey, // LEARNING: Use relationship key instead of GlobalAnnotationKey
        globalField: FIELD_NAMES.ANNOTATIONS as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_INSTANCE>,

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: "annotationInstance" as GlobalEntityKey, // LEARNING: Use entity key instead of GlobalAnnotationKey
        selectedChildPath: [FIELD_NAMES.ANNOTATIONS] as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_INSTANCE>[],

        candidateParentKey: ENTITY_KEY_BLOCK_INSTANCE, // Not used for annotations (all annotations are candidates)
        candidateParentPath: [],
        candidateChildKey: "annotationInstance" as GlobalEntityKey, // LEARNING: Use entity key instead of GlobalAnnotationKey
        candidateChildPath: [],

        selectType: RelationshipSelectTypeEnum.AnnotationAssignmentSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        placeholder: "Select annotations for this block instance...",
      },
    },
    
    [ENTITY_KEY_BLOCK_SHAPE]: {  
      validCascades: {
        targetMode: "relationship",
        targetKey: "validCascades",
        globalField: "validCascades" as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_SHAPE>,

        selectedParentKey: ENTITY_KEY_BLOCK_SHAPE,
        selectedChildKey: ENTITY_KEY_BLOCK_SHAPE,
        selectedChildPath: ["validCascades"] as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_SHAPE>[],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,                
        candidateParentPath: [],                        
        candidateChildKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateChildPath: [],                         

        selectType: RelationshipSelectTypeEnum.ValidCascadeSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        placeholder: "Which block shapes are valid as children?",
        
        dependencyImpact: {
          affectedEntityKey: ENTITY_KEY_BLOCK_INSTANCE,
          affectedField: "bookingCascades", 
          linkingField: "blockShapeRef",
          displayNames: {
            removedItems: "Block Shapes",
            affectedEntities: "Block Instances",
            affectedField: "booking cascades"
          }
        }
      },

      validParts: {
        targetMode: "relationship",
        targetKey: "validParts",
        globalField: "validParts" as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_SHAPE>,

        selectedParentKey: ENTITY_KEY_BLOCK_SHAPE,
        selectedChildKey: ENTITY_KEY_PART_SHAPE,
        selectedChildPath: ["validParts"] as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_SHAPE>[],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateParentPath: [],                         
        candidateChildKey: ENTITY_KEY_PART_SHAPE,
        candidateChildPath: [],                           

        selectType: RelationshipSelectTypeEnum.ValidPartSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        placeholder: "Which part shapes are valid as children?",
        
        dependencyImpact: {
          affectedEntityKey: ENTITY_KEY_PART_INSTANCE,
          affectedField: "partAssignments",
          linkingField: "partShapeRef", 
          displayNames: {
            removedItems: "Part Shapes",
            affectedEntities: "Part Instances",
            affectedField: "active parts"
          }
        }
      },
    },
    
    [ENTITY_KEY_PART_INSTANCE]: {
      partShapeRef: {
        targetMode: "property",
        targetKey: "partShape",
        globalField: "partShapeRef",

        selectedParentKey: ENTITY_KEY_PART_INSTANCE,
        selectedChildKey: ENTITY_KEY_PART_SHAPE,
        selectedChildPath: ["partShapeRef"],

        candidateParentKey: ENTITY_KEY_PART_SHAPE,   
        candidateParentPath: [],
        candidateChildKey: ENTITY_KEY_PART_SHAPE,
        candidateChildPath: [],

        selectType: TypeSelectEnum.PartShape,
        selectMode: RelationshipSelectModeEnum.Required,
        placeholder: "Select a part type",
      },
    },

    [ENTITY_KEY_PART_SHAPE]: {},
    eventShape: {},
    eventInstance: {},
    annotationShape: {},
    annotationInstance: {},
  }
}

