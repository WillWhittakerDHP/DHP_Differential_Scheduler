import {
  ENTITY_KEY_ANNOTATION_INSTANCE,
  ENTITY_KEY_BLOCK_INSTANCE,
  ENTITY_KEY_BLOCK_SHAPE,
  ENTITY_KEY_EVENT_INSTANCE,
  ENTITY_KEY_EVENT_SHAPE,
  ENTITY_KEY_PART_INSTANCE,
} from '@/constants/entities'
import { RelationshipSelectTypeEnum, RelationshipSelectModeEnum, TypeSelectEnum } from '@/types/entity/formDataEnums'

export const selectableDisplayBlockInstanceSection = {
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

      eventAssignments: {
        targetMode: "relationship",
        targetKey: "eventAssignments",
        globalField: "eventAssignments",

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: ENTITY_KEY_EVENT_INSTANCE,
        selectedChildPath: ["eventAssignments"],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateParentPath: ["blockShapeRef"],
        candidateChildKey: ENTITY_KEY_EVENT_INSTANCE,
        candidateChildPath: [],

        selectType: RelationshipSelectTypeEnum.EventAssignmentSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        groupByKey: "eventShapeRef",

        label: "Event Assignments",
        placeholder: "No events selected",
        inline: false,
        stacked: true,
        width: "100%",
        align: "left",
        displayFormat: "chips",
        emptyStateText: "No events assigned",
        maxDisplayItems: 10,
        showCount: true,
        sortBy: "name",
        sortDirection: "asc",

        meta: {
          visible: true,
          groupByKey: ENTITY_KEY_EVENT_SHAPE,
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
}
