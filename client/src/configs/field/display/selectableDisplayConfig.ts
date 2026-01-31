/**
 * LEARNING: Selectable Display Config Builder
 * WHY: Defines display configs for selectable fields (relationship and type selects)
 * PATTERN: Configures display properties for selectable fields
 */

import type { GlobalEntityKey } from '../../../constants/entities'
import { ENTITY_KEY_BLOCK_INSTANCE, ENTITY_KEY_BLOCK_SHAPE, ENTITY_KEY_PART_INSTANCE, ENTITY_KEY_PART_SHAPE } from '../../../constants/entities'
import type { GlobalFieldKey } from '../../../constants/primitives'
import type { GlobalRelationshipKey } from '../../../constants/relationships'
import { RelationshipSelectTypeEnum, RelationshipSelectModeEnum, TypeSelectEnum } from '../../../types/entity/formDataEnums'

// Union of all possible field keys from child entities
// FIX: Use entity key constants (these are string literals, so they work in types)
type ChildFieldKey = GlobalFieldKey<"blockInstance"> | GlobalFieldKey<"partInstance"> | GlobalFieldKey<"blockShape"> | GlobalFieldKey<"partShape">;

// LEARNING: Helper type to get valid relationship keys for an entity type
// WHY: Relationships are attached to entities but aren't part of GlobalFieldKey
// PATTERN: Explicitly map entity types to their valid relationship keys
// NOTE: Using string literals here because TypeScript type system needs literal types, not typeof constants
type ValidRelationshipKeys<GE extends GlobalEntityKey> = 
  GE extends "blockShape" ? "validCascades" | "validParts" | "validAnnotations" | "eventAssignments" :
  GE extends "blockInstance" ? "bookingCascades" | "partAssignments" | "annotationAssignments" | "instanceComponents" | "dependentInstances" :
  never;

// LEARNING: Union type that includes both field keys and valid relationship keys
// WHY: SelectableDisplayTypeSuite needs to allow entity fields and relationships
// PATTERN: Combine GlobalFieldKey with valid relationship keys for each entity type
// NOTE: Annotations are now core entities, so they're included in GlobalEntityKey
type SelectableFieldKey<GE extends GlobalEntityKey> = GlobalFieldKey<GE> | ValidRelationshipKeys<GE>;

export type RelationshipDisplayType<
  GE extends GlobalEntityKey = GlobalEntityKey,
  R extends GlobalRelationshipKey = GlobalRelationshipKey
> = {
  targetMode: "relationship";
  targetKey: R; 
  globalField: SelectableFieldKey<GE>;

  selectedParentKey: GE;
  selectedChildKey: GlobalEntityKey;
  selectedChildPath: SelectableFieldKey<GE>[];

  candidateParentKey: GlobalEntityKey;
  candidateParentPath: SelectableFieldKey<GE>[];
  candidateChildKey: GlobalEntityKey;
  candidateChildPath?: SelectableFieldKey<GE>[];

  selectType: RelationshipSelectTypeEnum;
  selectMode: RelationshipSelectModeEnum;
  groupByKey?: ChildFieldKey;
  
  // Display-specific properties
  label: string;
  placeholder?: string;
  className?: string;
  style?: Record<string, string | number>;
  tooltip?: string;
  inline?: boolean;
  stacked?: boolean;
  width?: number | string;
  align?: "left" | "center" | "right";
  
  // Display formatting options
  displayFormat?: "list" | "chips" | "badges" | "collection" | "cards";
  emptyStateText?: string;
  maxDisplayItems?: number;
  showCount?: boolean;
  sortBy?: "name" | "orderIndex" | "custom";
  sortDirection?: "asc" | "desc";
  
  meta?: {
    visible?: boolean;
    required?: boolean;
    disabled?: boolean;
    groupByKey?: GlobalEntityKey;
    defaultSort?: boolean;
  };
};

export type VirtualDisplayType<
  GE extends GlobalEntityKey = GlobalEntityKey,
> = {
  targetMode: "property";
  targetKey: typeof ENTITY_KEY_BLOCK_SHAPE | typeof ENTITY_KEY_PART_SHAPE;
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
  
  // Display-specific properties
  label: string;
  placeholder?: string;
  className?: string;
  style?: Record<string, string | number>;
  tooltip?: string;
  inline?: boolean;
  stacked?: boolean;
  width?: number | string;
  align?: "left" | "center" | "right";
  
  // Display formatting options
  displayFormat?: "text" | "badge" | "icon" | "chip";
  emptyStateText?: string;
  showIcon?: boolean;
  showCount?: boolean; // LEARNING: Show count of selected items (useful for multi-select virtual properties)
  
  meta?: {
    visible?: boolean;
    required?: boolean;
    disabled?: boolean;
    groupByKey?: GlobalEntityKey;
    defaultSort?: boolean;
  };
};

export type SelectableDisplayType<
  GE extends GlobalEntityKey = GlobalEntityKey
> =
  | RelationshipDisplayType<GE, GlobalRelationshipKey>
  | VirtualDisplayType<GE>;
  
export type SelectableDisplayTypeSuite = {
  [GE in GlobalEntityKey]: Partial<Record<SelectableFieldKey<GE>, SelectableDisplayType<GE>>>;
};

export function buildSelectableDisplayType(): SelectableDisplayTypeSuite {
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
        
        // Display properties
        label: "Block Type",
        placeholder: "No block type selected",
        inline: true,
        stacked: true,
        width: "25%",
        align: "left",
        displayFormat: "badge",
        emptyStateText: "No type assigned",
        showIcon: true,
        
        meta: { 
          groupByKey: ENTITY_KEY_BLOCK_SHAPE,
          visible: true,
          required: true
        },
      },

      bookingCascades: {
        targetMode: "relationship",
        targetKey: "bookingCascades",
        globalField: "bookingCascades",

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildPath: ["bookingCascades"],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateParentPath: ["blockShapeRef"],             
        candidateChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateChildPath: [],                         

        selectType: RelationshipSelectTypeEnum.BookingCascadeSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        groupByKey: "blockShapeRef",
        
        // Display properties
        label: "Booking Cascade",
        placeholder: "No cascades selected",
        inline: false,
        stacked: true,
        width: "100%",
        align: "left",
        displayFormat: "chips",
        emptyStateText: "No cascades assigned",
        maxDisplayItems: 10,
        showCount: true,
        sortBy: "name",
        sortDirection: "asc",
        
        meta: {
          visible: true,
          groupByKey: ENTITY_KEY_BLOCK_SHAPE
        },
      },
            
      partAssignments: {
        targetMode: "relationship",
        targetKey: "partAssignments",
        globalField: "partAssignments",

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: ENTITY_KEY_PART_INSTANCE,
        selectedChildPath: ["partAssignments"],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,                 
        candidateParentPath: ["blockShapeRef"],             
        candidateChildKey: ENTITY_KEY_PART_INSTANCE,
        candidateChildPath: [],                          

        selectType: RelationshipSelectTypeEnum.PartAssignmentSelect,
        selectMode: RelationshipSelectModeEnum.Nested,
        
        // Display properties
        label: "Part Assignments",
        placeholder: "No parts selected",
        inline: false,
        stacked: true,
        width: "100%",
        align: "left",
        displayFormat: "list",
        emptyStateText: "No parts assigned",
        maxDisplayItems: 15,
        showCount: true,
        sortBy: "name",
        sortDirection: "asc",
        
        meta: {
          visible: true
        },
      },

      dependentInstances: {
        targetMode: "relationship",
        targetKey: "dependentInstances",
        globalField: "dependentInstances",

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildPath: ["dependentInstances"],

        candidateParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateParentPath: [],
        candidateChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateChildPath: ["blockShapeRef"],

        selectType: RelationshipSelectTypeEnum.DependentInstanceSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        
        // Display properties
        label: "Dependent Instances",
        placeholder: "No dependent instances",
        inline: false,
        stacked: true,
        width: "100%",
        align: "left",
        displayFormat: "badges",
        emptyStateText: "No dependent instances defined",
        maxDisplayItems: 8,
        showCount: true,
        sortBy: "name",
        sortDirection: "asc",
        
        meta: {
          visible: true
        },
      },

      instanceComponents: {
        targetMode: "relationship",
        targetKey: "instanceComponents",
        globalField: "instanceComponents",

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildPath: ["instanceComponents"],

        candidateParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateParentPath: ["dependentInstances"],
        candidateChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateChildPath: [],

        selectType: RelationshipSelectTypeEnum.InstanceComponentSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        
        // Display properties
        label: "{blockShapeName} Components",
        placeholder: "Select components...",
        inline: false,
        stacked: true,
        width: "100%",
        align: "left",
        displayFormat: "chips",
        emptyStateText: "No service components selected",
        maxDisplayItems: 10,
        showCount: true,
        sortBy: "name",
        sortDirection: "asc",
        
        meta: {
          visible: true
        },
      },
    },
    
    [ENTITY_KEY_BLOCK_SHAPE]: {  
      validCascades: {
        targetMode: "relationship",
        targetKey: "validCascades",
        globalField: "validCascades",

        selectedParentKey: ENTITY_KEY_BLOCK_SHAPE,
        selectedChildKey: ENTITY_KEY_BLOCK_SHAPE,
        selectedChildPath: ["validCascades"],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,                
        candidateParentPath: [],                        
        candidateChildKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateChildPath: [],                         

        selectType: RelationshipSelectTypeEnum.ValidCascadeSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        
        // Display properties
        label: "Valid Booking Cascade",
        placeholder: "No valid cascades",
        tooltip: "Defines which block shapes can be selected as children in booking cascades. BlockInstances of this BlockShape can only select from these valid cascades in their 'Active Cascades' field. This controls the hierarchical relationship options available during booking.",
        inline: false,
        stacked: true,
        width: "100%",
        align: "left",
        displayFormat: "badges",
        emptyStateText: "No valid cascades defined",
        maxDisplayItems: 8,
        showCount: true,
        sortBy: "name",
        sortDirection: "asc",
        
        meta: {
          visible: true
        },
      },

      validParts: {
        targetMode: "relationship",
        targetKey: "validParts",
        globalField: "validParts",

        selectedParentKey: ENTITY_KEY_BLOCK_SHAPE,
        selectedChildKey: ENTITY_KEY_PART_SHAPE,
        selectedChildPath: ["validParts"],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateParentPath: [],                         
        candidateChildKey: ENTITY_KEY_PART_SHAPE,
        candidateChildPath: [],                           

        selectType: RelationshipSelectTypeEnum.ValidPartSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        
        // Display properties
        label: "Valid Part Shapes",
        placeholder: "No valid part shapes",
        inline: false,
        stacked: true,
        width: "100%",
        align: "left",
        displayFormat: "badges",
        emptyStateText: "No valid part shapes defined",
        maxDisplayItems: 12,
        showCount: true,
        sortBy: "name",
        sortDirection: "asc",
        
        meta: {
          visible: true
        },
      },
    },
    
    [ENTITY_KEY_PART_INSTANCE]: {
      partShapeRef: {
        targetMode: "property",
        targetKey: ENTITY_KEY_PART_SHAPE,
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
        
        // Display properties
        label: "Part Type",
        placeholder: "No part type selected",
        inline: true,
        stacked: true,
        width: "25%",
        align: "left",
        displayFormat: "badge",
        emptyStateText: "No type assigned",
        showIcon: true,
        
        meta: { 
          groupByKey: ENTITY_KEY_PART_SHAPE,
          visible: true,
          required: true
        },
      },
    },

    [ENTITY_KEY_PART_SHAPE]: {},
    eventShape: {},
    eventInstance: {},
    annotationShape: {},
    annotationInstance: {},
  }
}

