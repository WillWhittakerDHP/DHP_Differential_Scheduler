import {
  ENTITY_KEY_PART_INSTANCE,
  ENTITY_KEY_PART_SHAPE,
} from '@/constants/entities'
import { RelationshipSelectTypeEnum, RelationshipSelectModeEnum, TypeSelectEnum } from '@/types/entity/formDataEnums'

export const selectableDisplayPartsAndPlaceholderSection = {
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
