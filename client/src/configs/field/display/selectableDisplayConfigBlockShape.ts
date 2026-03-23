import {
  ENTITY_KEY_ANNOTATION_SHAPE,
  ENTITY_KEY_BLOCK_SHAPE,
  ENTITY_KEY_EVENT_SHAPE,
  ENTITY_KEY_PART_SHAPE,
} from '@/constants/entities'
import { RelationshipSelectTypeEnum, RelationshipSelectModeEnum } from '@/types/entity/formDataEnums'

export const selectableDisplayBlockShapeSection = {
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

      validEvents: {
        targetMode: "relationship",
        targetKey: "validEvents",
        globalField: "validEvents",

        selectedParentKey: ENTITY_KEY_BLOCK_SHAPE,
        selectedChildKey: ENTITY_KEY_EVENT_SHAPE,
        selectedChildPath: ["validEvents"],

        candidateParentKey: ENTITY_KEY_BLOCK_SHAPE,
        candidateParentPath: [],
        candidateChildKey: ENTITY_KEY_EVENT_SHAPE,
        candidateChildPath: [],

        selectType: RelationshipSelectTypeEnum.ValidEventSelect,
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
