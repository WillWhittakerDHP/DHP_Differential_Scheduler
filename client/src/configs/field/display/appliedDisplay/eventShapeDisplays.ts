import { DISPLAY_LABELS, ENTITY_STATUS } from '@/constants/entityFieldConstants'


export const eventShapeDisplays = {
  id: {
    label: "ID",
    placeholder: "This Field Should Be Hidden",
    inline: false,
    stacked: false,
  },

  name: {
    label: DISPLAY_LABELS.NAME,
    placeholder: "Enter event type name",
    inline: false,
    stacked: true,
  },

  orderIndex: {
    label: "Order Index",
    placeholder: "This Field Should Be Hidden",
    inline: false,
    stacked: false,
  },

  placementKind: {
    label: 'Timing behavior',
    placeholder: 'Choose where this segment sits relative to the main appointment window',
    inline: true,
    stacked: false,
  },

  anchorEdge: {
    label: 'Timing anchor',
    placeholder: 'Managed by Timing behavior',
    inline: true,
    stacked: false,
  },

  active: {
    label: ENTITY_STATUS.ACTIVE,
    placeholder: ENTITY_STATUS.ACTIVE,
    inline: true,
    stacked: false,
  },
} as const;
