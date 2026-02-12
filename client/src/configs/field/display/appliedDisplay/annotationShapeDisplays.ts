import { DISPLAY_LABELS, ENTITY_STATUS } from '../../../../constants/entityFieldConstants'

/**
 * LEARNING: AnnotationShape Display Configs (Configuration Data)
 * WHY: Defines labels, placeholders, and layout for AnnotationShape fields
 * PATTERN: Similar structure to entity display configs but for configuration data
 * NOTE: These are NOT entities, so they may not integrate into full display config system
 */

export const annotationShapeDisplays = {
  id: {
    label: "ID",
    placeholder: "This Field Should Be Hidden",
    inline: false,
    stacked: false,
  },

  name: {
    label: DISPLAY_LABELS.NAME,
    placeholder: "Enter annotation shape name",
    inline: false,
    stacked: true,
  },

  orderIndex: {
    label: "Order Index",
    placeholder: "This Field Should Be Hidden",
    inline: false,
    stacked: false,
  },

  active: {
    label: ENTITY_STATUS.ACTIVE,
    placeholder: ENTITY_STATUS.ACTIVE,
    inline: true,
    stacked: false,
  },
} as const;
