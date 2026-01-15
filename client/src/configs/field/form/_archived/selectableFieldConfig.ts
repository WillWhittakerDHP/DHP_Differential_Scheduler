/**
 * LEARNING: Selectable Field Config Builder
 * WHY: Defines which fields are selectable (relationship or type selects)
 * PATTERN: Configures relationship and type select fields for each entity
 */

import type { GlobalEntityKey } from '../../../constants/entities'
import { ENTITY_KEY_BLOCK_INSTANCE, ENTITY_KEY_BLOCK_SHAPE, ENTITY_KEY_PART_INSTANCE, ENTITY_KEY_PART_SHAPE } from '../../../constants/entities'
import type { GlobalFieldKey } from '../../../constants/primitives'
import type { GlobalRelationshipKey } from '../../../constants/relationships'
import type { GlobalAnnotationKey } from '../../../constants/annotations'
import { RelationshipSelectTypeEnum, RelationshipSelectModeEnum, TypeSelectEnum } from '../../../types/entity/formDataEnums'

// Union of all possible field keys from child entities
type ChildFieldKey = GlobalFieldKey<typeof ENTITY_KEY_BLOCK_INSTANCE> | GlobalFieldKey<typeof ENTITY_KEY_PART_INSTANCE> | GlobalFieldKey<typeof ENTITY_KEY_BLOCK_SHAPE> | GlobalFieldKey<typeof ENTITY_KEY_PART_SHAPE>;

export type RelationshipFieldType<
  GE extends GlobalEntityKey = GlobalEntityKey,
  R extends GlobalRelationshipKey = GlobalRelationshipKey
> = {
  targetMode: "relationship";
  targetKey: R | GlobalAnnotationKey;
  globalField: GlobalFieldKey<GE>;

  selectedParentKey: GE;
  selectedChildKey: GlobalEntityKey | GlobalAnnotationKey;
  selectedChildPath: GlobalFieldKey<GE>[];

  candidateParentKey: GlobalEntityKey;
  candidateParentPath: GlobalFieldKey<GE>[];
  candidateChildKey: GlobalEntityKey | GlobalAnnotationKey;
  candidateChildPath?: GlobalFieldKey<GE>[];

  selectType: RelationshipSelectTypeEnum;
  selectMode: RelationshipSelectModeEnum;
  groupByKey?: ChildFieldKey;
  placeholder?: string;
  optionsFieldKey?: string;
  modeToggle?: {
    enabled: boolean;
    controlField: string;
  };
  dependencyImpact?: {
    affectedEntityKey: GlobalEntityKey;
    affectedField: string;
    linkingField: string;
    displayNames: {
      removedItems: string;
      affectedEntities: string;
      affectedField: string;
    };
  };
};

export type VirtualFieldType<
  GE extends GlobalEntityKey = GlobalEntityKey,
> = {
  targetMode: "property";
  targetKey: "blockShape" | "partShape";
  globalField: GlobalFieldKey<GE>;

  selectedParentKey: GE;
  selectedChildKey: GlobalEntityKey;
  selectedChildPath: GlobalFieldKey<GE>[];

  candidateParentKey: GlobalEntityKey;
  candidateParentPath: GlobalFieldKey<GE>[];
  candidateChildKey: GlobalEntityKey;
  candidateChildPath: GlobalFieldKey<GE>[];

  selectType: TypeSelectEnum;
  selectMode: RelationshipSelectModeEnum;
  groupByKey?: GlobalFieldKey<GlobalEntityKey>;
  placeholder?: string;
  modeToggle?: {
    enabled: boolean;
    controlField: string;
  };
};

export type SelectableFieldType<
  GE extends GlobalEntityKey = GlobalEntityKey
> =
  | RelationshipFieldType<GE, GlobalRelationshipKey>
  | VirtualFieldType<GE>;
  
// LEARNING: Union type that includes both field keys and annotation keys
// WHY: Annotations aren't part of GlobalFieldKey but need to be configurable
// PATTERN: Allow both field keys and annotation keys for selectable fields
type SelectableFieldKey<GE extends GlobalEntityKey> = GlobalFieldKey<GE> | GlobalAnnotationKey;

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
        selectedChildPath: ["bookingCascades"] as unknown as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_INSTANCE>[],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateParentPath: ["blockShapeRef"],             
        candidateChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateChildPath: [],                         

        selectType: RelationshipSelectTypeEnum.BookingCascadeSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        groupByKey: "blockShapeRef", // LEARNING: groupByKey must be a field key, not an entity key
        placeholder: "Which block instances are children of this block instance?",
      },
            
      activeConstituents: {
        targetMode: "relationship",
        targetKey: "activeConstituents",
        globalField: "activeConstituents" as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_INSTANCE>,

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: ENTITY_KEY_PART_INSTANCE,
        selectedChildPath: ["activeConstituents"] as unknown as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_INSTANCE>[],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,                 
        candidateParentPath: ["blockShapeRef"],             
        candidateChildKey: ENTITY_KEY_PART_INSTANCE,
        candidateChildPath: [],                          

        selectType: RelationshipSelectTypeEnum.ActiveConstituentSelect,
        selectMode: RelationshipSelectModeEnum.Nested,
        placeholder: "Which part instances are used by this block instance?",
        optionsFieldKey: "validConstituents", // Field on blockShape containing valid part shapes
      },

      dependentInstanceOptions: {
        targetMode: "relationship",
        targetKey: "dependentInstanceOptions",
        globalField: "dependentInstanceOptions" as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_INSTANCE>,

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildPath: ["dependentInstanceOptions"] as unknown as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_INSTANCE>[],

        candidateParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateParentPath: ["blockShapeRef"], // LEARNING: Filter candidates by current blockInstance's blockShapeRef
        candidateChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateChildPath: ["blockShapeRef"], // Filter child candidates by matching blockShapeRef

        selectType: RelationshipSelectTypeEnum.DependentInstanceOptionSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        placeholder: "Which block instances are valid as dependent options?",
      },

      instanceComponents: {
        targetMode: "relationship",
        targetKey: "instanceComponents",
        globalField: "instanceComponents",

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildPath: ["instanceComponents"],

        candidateParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateParentPath: ["blockShapeRef"], // LEARNING: Always filter by blockShapeRef, not dependentInstanceOptions
        candidateChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateChildPath: ["blockShapeRef"], // Filter child candidates by matching blockShapeRef

        selectType: RelationshipSelectTypeEnum.InstanceComponentSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        placeholder: "Select service components...",
      },

      annotations: {
        targetMode: "relationship",
        targetKey: "annotations" as GlobalAnnotationKey,
        globalField: "annotations" as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_INSTANCE>,

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: "annotations" as GlobalAnnotationKey,
        selectedChildPath: ["annotations"] as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_INSTANCE>[],

        candidateParentKey: ENTITY_KEY_BLOCK_INSTANCE, // Not used for annotations (all annotations are candidates)
        candidateParentPath: [],
        candidateChildKey: "annotations" as GlobalAnnotationKey, // Not used for annotations (all annotations are candidates)
        candidateChildPath: [],

        selectType: RelationshipSelectTypeEnum.DescriptionSelect,
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
        selectedChildPath: ["validCascades"] as unknown as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_SHAPE>[],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,                
        candidateParentPath: [],                        
        candidateChildKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateChildPath: [],                         

        selectType: RelationshipSelectTypeEnum.ValidCascadeSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        placeholder: "Which block shapes are valid as children?",
        
        // 🆕 Dependency impact configuration
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

      validConstituents: {
        targetMode: "relationship",
        targetKey: "validConstituents",
        globalField: "validConstituents" as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_SHAPE>,

        selectedParentKey: ENTITY_KEY_BLOCK_SHAPE,
        selectedChildKey: ENTITY_KEY_PART_SHAPE,
        selectedChildPath: ["validConstituents"] as unknown as GlobalFieldKey<typeof ENTITY_KEY_BLOCK_SHAPE>[],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateParentPath: [],                         
        candidateChildKey: ENTITY_KEY_PART_SHAPE,
        candidateChildPath: [],                           

        selectType: RelationshipSelectTypeEnum.ValidConstituentSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        placeholder: "Which part shapes are valid as children?",
        
        // 🆕 Dependency impact configuration
        dependencyImpact: {
          affectedEntityKey: ENTITY_KEY_PART_INSTANCE,
          affectedField: "activeConstituents",
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

    [ENTITY_KEY_PART_SHAPE]: {}
  }
}

