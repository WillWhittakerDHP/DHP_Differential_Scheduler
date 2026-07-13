import {
  ENTITY_KEY_ANNOTATION_SHAPE,
  ENTITY_KEY_BLOCK_SHAPE,
  ENTITY_KEY_EVENT_SHAPE,
  ENTITY_KEY_PART_SHAPE,
} from '@/constants/entities'
import { RelationshipSelectTypeEnum, RelationshipSelectModeEnum } from '@/types/entity/formDataEnums'

export const selectableDisplayBlockShapeSection = {
    [ENTITY_KEY_BLOCK_SHAPE]: {  
      validBookingCascades: {
        targetMode: "relationship",
        targetKey: "validBookingCascades",
        globalField: "validBookingCascades",

        selectedParentKey: ENTITY_KEY_BLOCK_SHAPE,
        selectedChildKey: ENTITY_KEY_BLOCK_SHAPE,
        selectedChildPath: ["validBookingCascades"],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,                
        candidateParentPath: [],                        
        candidateChildKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateChildPath: [],                         

        selectType: RelationshipSelectTypeEnum.ValidBookingCascadeSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,
        
        label: "Allowed Downstream Shapes",
        placeholder: "Choose shapes this shape can link to...",
        tooltip: "Shape-level allowlist for downstream instance links. Example: if Service can link to Event, then Buyer's Inspection can choose Minimize Time On Site and Walk & Talk can choose Hour Inside on their own instance cards.",
        inline: false,
        stacked: true,
        width: "100%",
        align: "left",
        displayFormat: "badges",
        emptyStateText: "No downstream shapes allowed yet. Instance cards for this shape will have no downstream link options until this is configured.",
        maxDisplayItems: 8,
        showCount: true,
        sortBy: "name",
        sortDirection: "asc",
        
        meta: {
          visible: true
        },
      },

      validPartCascades: {
        targetMode: "relationship",
        targetKey: "validPartCascades",
        globalField: "validPartCascades",

        selectedParentKey: ENTITY_KEY_BLOCK_SHAPE,
        selectedChildKey: ENTITY_KEY_PART_SHAPE,
        selectedChildPath: ["validPartCascades"],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateParentPath: [],                         
        candidateChildKey: ENTITY_KEY_PART_SHAPE,
        candidateChildPath: [],                           

        selectType: RelationshipSelectTypeEnum.ValidPartCascadeSelect,
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

      validAnnotationAssignments: {
        targetMode: "relationship",
        targetKey: "validAnnotationAssignments",
        globalField: "validAnnotationAssignments",

        selectedParentKey: ENTITY_KEY_BLOCK_SHAPE,
        selectedChildKey: ENTITY_KEY_ANNOTATION_SHAPE,
        selectedChildPath: ["validAnnotationAssignments"],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateParentPath: [],
        candidateChildKey: ENTITY_KEY_ANNOTATION_SHAPE,
        candidateChildPath: [],

        selectType: RelationshipSelectTypeEnum.ValidAnnotationAssignmentSelect,
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

      validEventCascades: {
        targetMode: "relationship",
        targetKey: "validEventCascades",
        globalField: "validEventCascades",

        selectedParentKey: ENTITY_KEY_BLOCK_SHAPE,
        selectedChildKey: ENTITY_KEY_EVENT_SHAPE,
        selectedChildPath: ["validEventCascades"],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateParentPath: [],
        candidateChildKey: ENTITY_KEY_EVENT_SHAPE,
        candidateChildPath: [],

        selectType: RelationshipSelectTypeEnum.ValidEventCascadeSelect,
        selectMode: RelationshipSelectModeEnum.Multiple,

        label: "Valid Events",
        placeholder: "No events selected",
        inline: false,
        stacked: true,
        width: "100%",
        align: "left",
        displayFormat: "badges",
        emptyStateText: "No valid events defined",
        maxDisplayItems: 8,
        showCount: true,
        sortBy: "name",
        sortDirection: "asc",

        meta: {
          visible: true,
        },
      },
    },
}
