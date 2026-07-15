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
        
        label: "Active Time Blocks",
        placeholder: "Choose active time blocks...",
        tooltip: "Concrete time blocks activated by this service. Events claim these time blocks to decide which calendar segment owns their parts.",
        inline: false,
        stacked: true,
        width: "100%",
        align: "left",
        displayFormat: "chips",
        emptyStateText: "No active time blocks linked. If this list is empty, check Allowed time block shapes on the parent shape card.",
        maxDisplayItems: 10,
        showCount: true,
        sortBy: "name",
        sortDirection: "asc",
        
        meta: {
          visible: true,
          groupByKey: ENTITY_KEY_BLOCK_SHAPE
        },
      },

      accumulationLinks: {
        targetMode: "relationship",
        targetKey: "accumulationLinks",
        globalField: "accumulationLinks",

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildPath: ["accumulationLinks"],

        candidateParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateParentPath: [],
        candidateChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateChildPath: [],

        selectType: RelationshipSelectTypeEnum.AccumulationLinkSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        groupByKey: "blockShapeRef",

        label: "Accumulation Links",
        placeholder: "Choose time characteristics to auto-include...",
        tooltip:
          "Lateral inclusion gates: when this accumulator service is selected, include these time characteristics only if the matching Property Detail Fact is present for the inspected property. Set property_fact_key on each link (API/SQL for now) — empty key never includes.",
        inline: false,
        stacked: true,
        width: "100%",
        align: "left",
        displayFormat: "chips",
        emptyStateText: "No eligible time characteristics found. Create active time block instances first; then link them here and set each link's Property Detail Fact.",
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

      instanceComponents: {
        targetMode: "relationship",
        targetKey: "instanceComponents",
        globalField: "instanceComponents",

        selectedParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        selectedChildPath: ["instanceComponents"],

        candidateParentKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateParentPath: ["blockShapeRef"],
        candidateChildKey: ENTITY_KEY_BLOCK_INSTANCE,
        candidateChildPath: [],

        selectType: RelationshipSelectTypeEnum.InstanceComponentSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        
        label: "{blockShapeName} Components",
        placeholder: "Select same-shape sub-options...",
        tooltip: "Same-shape children bundled under this composite instance. This is separate from Downstream instance links, which connect to other shapes.",
        inline: false,
        stacked: true,
        width: "100%",
        align: "left",
        displayFormat: "chips",
        emptyStateText: "No same-shape components selected",
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
