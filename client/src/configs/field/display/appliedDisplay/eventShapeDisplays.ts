import { DISPLAY_LABELS, ENTITY_STATUS } from '@/constants/entityFieldConstants'

/**
 * NOTE: These are NOT entities, so they may not integrate into full display config system
 */

export const eventShapeDisplays = {
  id: {
    label: "ID",
    placeholder: "This Field Should Be Hidden",
    inline: false,
    stacked: false,
  },

  name: {
    label: DISPLAY_LABELS.NAME,
    placeholder: "Enter event shape name",
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

  differentialRole: {
    label: "Differential Role",
    placeholder: "Select differential role",
    inline: true,
    stacked: false,
  },
} as const;
