
import type { GlobalEntityKey } from '@/constants/entities'
import {
  ENTITY_KEY_ANNOTATION_INSTANCE,
  ENTITY_KEY_ANNOTATION_SHAPE,
  ENTITY_KEY_BLOCK_INSTANCE,
  ENTITY_KEY_BLOCK_SHAPE,
  ENTITY_KEY_PART_INSTANCE,
  ENTITY_KEY_PART_SHAPE,
} from '@/constants/entities'
import { FIELD_NAMES } from '@/constants/entityFieldConstants'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { GlobalRelationshipKey } from '@/constants/relationships'
import { RelationshipSelectTypeEnum, RelationshipSelectModeEnum, TypeSelectEnum } from '@/types/entity/formDataEnums'

// FIX: Use entity key constants (these are string literals, so they work in types)
type ChildFieldKey = GlobalFieldKey<"blockInstance"> | GlobalFieldKey<"partInstance"> | GlobalFieldKey<"blockShape"> | GlobalFieldKey<"partShape">;

type ValidRelationshipKeys<GE extends GlobalEntityKey> =
  GE extends "blockShape" ? "validCascades" | "validParts" | "validAnnotations" | "eventAssignments" :
  GE extends "blockInstance" ? "bookingCascades" | "partAssignments" | "annotationAssignments" | "instanceComponents" | "dependentInstances" :
  GE extends "partInstance" ? "pricingCascades" :
  GE extends "partShape" ? "validPricingCascades" :
  never;

type SelectableFieldKey<GE extends GlobalEntityKey> = GlobalFieldKey<GE> | ValidRelationshipKeys<GE>;

type RelationshipDisplayType<
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
  
  label: string;
  placeholder?: string;
  className?: string;
  style?: Record<string, string | number>;
  tooltip?: string;
  inline?: boolean;
  stacked?: boolean;
  width?: number | string;
  align?: "left" | "center" | "right";
  
  displayFormat?: "list" | "chips" | "badges" | "collection" | "cards";
  emptyStateText?: string;
  maxDisplayItems?: number;
  showCount?: boolean;
  sortBy?: "name" | typeof FIELD_NAMES.ORDER_INDEX | "custom";
  sortDirection?: "asc" | "desc";
  
  meta?: {
    visible?: boolean;
    required?: boolean;
    disabled?: boolean;
    groupByKey?: GlobalEntityKey;
    defaultSort?: boolean;
  };
};

type VirtualDisplayType<
  GE extends GlobalEntityKey = GlobalEntityKey,
> = {
  targetMode: "primitive";
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
  
  label: string;
  placeholder?: string;
  className?: string;
  style?: Record<string, string | number>;
  tooltip?: string;
  inline?: boolean;
  stacked?: boolean;
  width?: number | string;
  align?: "left" | "center" | "right";
  
  displayFormat?: "text" | "badge" | "icon" | "chip";
  emptyStateText?: string;
  showIcon?: boolean;
  
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
  
type SelectableDisplayTypeSuite = {
  [GE in GlobalEntityKey]: Partial<Record<SelectableFieldKey<GE>, SelectableDisplayType<GE>>>;
};

export function buildSelectableDisplayType(): SelectableDisplayTypeSuite {
  return {
    [ENTITY_KEY_BLOCK_INSTANCE]: {
      blockShapeRef: {
        targetMode: "primitive",
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

      annotationAssignments: {
        targetMode: "relationship",
        targetKey: "annotationAssignments",
        globalField: "annotationAssignments",

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: ENTITY_KEY_ANNOTATION_INSTANCE,
        selectedChildPath: ["annotationAssignments"],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateParentPath: ["blockShapeRef"],
        candidateChildKey: ENTITY_KEY_ANNOTATION_INSTANCE,
        candidateChildPath: [],

        selectType: RelationshipSelectTypeEnum.AnnotationAssignmentSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,

        label: "Annotation Assignments",
        placeholder: "No annotations selected",
        inline: false,
        stacked: true,
        width: "100%",
        align: "left",
        displayFormat: "list",
        emptyStateText: "No annotations assigned",
        maxDisplayItems: 15,
        showCount: true,
        sortBy: "name",
        sortDirection: "asc",

        meta: {
          visible: true,
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

      validAnnotations: {
        targetMode: "relationship",
        targetKey: "validAnnotations",
        globalField: "validAnnotations",

        selectedParentKey: ENTITY_KEY_BLOCK_SHAPE,
        selectedChildKey: ENTITY_KEY_ANNOTATION_SHAPE,
        selectedChildPath: ["validAnnotations"],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateParentPath: [],
        candidateChildKey: ENTITY_KEY_ANNOTATION_SHAPE,
        candidateChildPath: [],

        selectType: RelationshipSelectTypeEnum.ValidAnnotationSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,

        label: "Valid Annotation Shapes",
        placeholder: "No annotation shapes selected",
        inline: false,
        stacked: true,
        width: "100%",
        align: "left",
        displayFormat: "badges",
        emptyStateText: "No valid annotation shapes defined",
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
        targetMode: "primitive",
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

      pricingCascades: {
        targetMode: "relationship",
        targetKey: "pricingCascades",
        globalField: "pricingCascades",

        selectedParentKey: ENTITY_KEY_PART_INSTANCE,
        selectedChildKey: ENTITY_KEY_PART_INSTANCE,
        selectedChildPath: ["pricingCascades"],

        candidateParentKey: ENTITY_KEY_PART_SHAPE,
        candidateParentPath: ["partShapeRef"],
        candidateChildKey: ENTITY_KEY_PART_INSTANCE,
        candidateChildPath: [],

        selectType: RelationshipSelectTypeEnum.PricingCascadeSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        groupByKey: "partShapeRef",

        label: "Pricing Cascade",
        placeholder: "No pricing cascades selected",
        inline: false,
        stacked: true,
        width: "100%",
        align: "left",
        displayFormat: "chips",
        emptyStateText: "No pricing cascades assigned",
        maxDisplayItems: 10,
        showCount: true,
        sortBy: "name",
        sortDirection: "asc",

        meta: {
          visible: true,
          groupByKey: ENTITY_KEY_PART_SHAPE,
        },
      },
    },

    [ENTITY_KEY_PART_SHAPE]: {
      validPricingCascades: {
        targetMode: "relationship",
        targetKey: "validPricingCascades",
        globalField: "validPricingCascades",

        selectedParentKey: ENTITY_KEY_PART_SHAPE,
        selectedChildKey: ENTITY_KEY_PART_SHAPE,
        selectedChildPath: ["validPricingCascades"],

        candidateParentKey: ENTITY_KEY_PART_SHAPE,
        candidateParentPath: [],
        candidateChildKey: ENTITY_KEY_PART_SHAPE,
        candidateChildPath: [],

        selectType: RelationshipSelectTypeEnum.ValidPricingCascadeSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,

        label: "Valid Pricing Cascades",
        placeholder: "No valid pricing cascades",
        inline: false,
        stacked: true,
        width: "100%",
        align: "left",
        displayFormat: "badges",
        emptyStateText: "No valid pricing cascades defined",
        maxDisplayItems: 8,
        showCount: true,
        sortBy: "name",
        sortDirection: "asc",

        meta: {
          visible: true,
        },
      },
    },
    eventShape: {},
    eventInstance: {},
    annotationShape: {},
    annotationInstance: {},
  }
}

