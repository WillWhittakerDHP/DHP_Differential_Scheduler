/**
 * LEARNING: Selectable Display Config Builder
 * WHY: Defines display configs for selectable fields (relationship and type selects)
 * PATTERN: Configures display properties for selectable fields
 */

import type { GlobalEntityKey } from '../../../constants/entities'
import type { GlobalFieldKey } from '../../../constants/primitives'
import type { GlobalRelationshipKey } from '../../../constants/relationships'
import type { GlobalAnnotationKey } from '../../../constants/annotations'
import { RelationshipSelectTypeEnum, RelationshipSelectModeEnum, TypeSelectEnum } from '../../../types/entity/formDataEnums'

// Union of all possible field keys from child entities
type ChildFieldKey = GlobalFieldKey<"blockInstance"> | GlobalFieldKey<"partInstance"> | GlobalFieldKey<"blockShape"> | GlobalFieldKey<"partShape">;

// LEARNING: Helper type to get valid relationship keys for an entity type
// WHY: Relationships are attached to entities but aren't part of GlobalFieldKey
// PATTERN: Explicitly map entity types to their valid relationship keys
type ValidRelationshipKeys<GE extends GlobalEntityKey> = 
  GE extends "blockShape" ? "validCascades" | "validConstituents" :
  GE extends "blockInstance" ? "bookingCascades" | "activeConstituents" | "instanceComponents" | "dependentInstanceOptions" :
  never;

// LEARNING: Union type that includes both field keys, valid relationship keys, and annotation keys
// WHY: SelectableDisplayTypeSuite needs to allow entity fields, relationships, and annotations
// PATTERN: Combine GlobalFieldKey with valid relationship keys and annotation keys for each entity type
type SelectableFieldKey<GE extends GlobalEntityKey> = GlobalFieldKey<GE> | ValidRelationshipKeys<GE> | GlobalAnnotationKey;

export type RelationshipDisplayType<
  GE extends GlobalEntityKey = GlobalEntityKey,
  R extends GlobalRelationshipKey = GlobalRelationshipKey
> = {
  targetMode: "relationship";
  targetKey: R | GlobalAnnotationKey; 
  globalField: SelectableFieldKey<GE>;

  selectedParentKey: GE;
  selectedChildKey: GlobalEntityKey | GlobalAnnotationKey;
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
    blockInstance: {
      blockShapeRef: {
        targetMode: "property",
        targetKey: "blockShape",
        globalField: "blockShapeRef",

        selectedParentKey: "blockInstance",
        selectedChildKey: "blockShape",
        selectedChildPath: ["blockShapeRef"],

        candidateParentKey: "blockShape", 
        candidateParentPath: [],        
        candidateChildKey: "blockShape",
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
          groupByKey: "blockShape",
          visible: true,
          required: true
        },
      },

      bookingCascades: {
        targetMode: "relationship",
        targetKey: "bookingCascades",
        globalField: "bookingCascades",

        selectedParentKey: "blockInstance",
        selectedChildKey: "blockInstance",
        selectedChildPath: ["bookingCascades"],

        candidateParentKey: "blockShape",
        candidateParentPath: ["blockShapeRef"],             
        candidateChildKey: "blockInstance",
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
          groupByKey: "blockShape"
        },
      },
            
      activeConstituents: {
        targetMode: "relationship",
        targetKey: "activeConstituents",
        globalField: "activeConstituents",

        selectedParentKey: "blockInstance",
        selectedChildKey: "partInstance",
        selectedChildPath: ["activeConstituents"],

        candidateParentKey: "blockShape",                 
        candidateParentPath: ["blockShapeRef"],             
        candidateChildKey: "partInstance",
        candidateChildPath: [],                          

        selectType: RelationshipSelectTypeEnum.ActiveConstituentSelect,
        selectMode: RelationshipSelectModeEnum.Nested,
        
        // Display properties
        label: "Active Parts",
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

      dependentInstanceOptions: {
        targetMode: "relationship",
        targetKey: "dependentInstanceOptions",
        globalField: "dependentInstanceOptions",

        selectedParentKey: "blockInstance",
        selectedChildKey: "blockInstance",
        selectedChildPath: ["dependentInstanceOptions"],

        candidateParentKey: "blockInstance",
        candidateParentPath: [],
        candidateChildKey: "blockInstance",
        candidateChildPath: ["blockShapeRef"],

        selectType: RelationshipSelectTypeEnum.DependentInstanceOptionSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        
        // Display properties
        label: "Dependent Instance Options",
        placeholder: "No dependent instance options",
        inline: false,
        stacked: true,
        width: "100%",
        align: "left",
        displayFormat: "badges",
        emptyStateText: "No dependent instance options defined",
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

        selectedParentKey: "blockInstance",
        selectedChildKey: "blockInstance",
        selectedChildPath: ["instanceComponents"],

        candidateParentKey: "blockInstance",
        candidateParentPath: ["dependentInstanceOptions"],
        candidateChildKey: "blockInstance",
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
    
    blockShape: {  
      validCascades: {
        targetMode: "relationship",
        targetKey: "validCascades",
        globalField: "validCascades",

        selectedParentKey: "blockShape",
        selectedChildKey: "blockShape",
        selectedChildPath: ["validCascades"],

        candidateParentKey: "blockShape",                
        candidateParentPath: [],                        
        candidateChildKey: "blockShape",
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

      validConstituents: {
        targetMode: "relationship",
        targetKey: "validConstituents",
        globalField: "validConstituents",

        selectedParentKey: "blockShape",
        selectedChildKey: "partShape",
        selectedChildPath: ["validConstituents"],

        candidateParentKey: "blockShape",
        candidateParentPath: [],                         
        candidateChildKey: "partShape",
        candidateChildPath: [],                           

        selectType: RelationshipSelectTypeEnum.ValidConstituentSelect,
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
    
    partInstance: {
      partShapeRef: {
        targetMode: "property",
        targetKey: "partShape",
        globalField: "partShapeRef",

        selectedParentKey: "partInstance",
        selectedChildKey: "partShape",
        selectedChildPath: ["partShapeRef"],

        candidateParentKey: "partShape",   
        candidateParentPath: [],
        candidateChildKey: "partShape",
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
          groupByKey: "partShape",
          visible: true,
          required: true
        },
      },
    },

    partShape: {}
  }
}

