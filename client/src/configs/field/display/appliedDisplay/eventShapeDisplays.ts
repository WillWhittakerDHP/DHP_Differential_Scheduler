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

  placementKind: {
    label: 'Placement kind',
    placeholder: 'primary | secondary | marginal | floating',
    inline: true,
    stacked: false,
  },

  anchorEdge: {
    label: 'Anchor edge',
    placeholder: 'start | end (omit for primary)',
    inline: true,
    stacked: false,
  },
} as const;
