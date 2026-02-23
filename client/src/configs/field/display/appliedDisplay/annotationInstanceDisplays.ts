import { ENTITY_STATUS } from '@/constants/entityFieldConstants'

/**
 * NOTE: These are NOT entities, so they may not integrate into full display config system
 */

export const annotationInstanceDisplays = {
  id: {
    label: "ID",
    placeholder: "This Field Should Be Hidden",
    inline: false,
    stacked: false,
  },

  text: {
    label: "Text",
    placeholder: "Enter annotation text",
    inline: false,
    stacked: true,
  },

  type: {
    label: "Annotation Type",
    placeholder: "Select annotation shape",
    inline: false,
    stacked: true,
  },

  userTypeBlock: {
    label: "User Type Block",
    placeholder: "Select user type block (or leave empty for generic)",
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
