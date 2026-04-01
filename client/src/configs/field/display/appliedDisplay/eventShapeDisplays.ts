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

  differentialRole: {
    label: "Differential role",
    placeholder: "Select scheduling role (or none)",
    inline: true,
    stacked: false,
  },

  includeRescheduleLink: {
    label: "Include reschedule link",
    placeholder: "Show {rescheduleLink} in calendar invite templates",
    inline: true,
    stacked: false,
  },

  includeCancelLink: {
    label: "Include cancel link",
    placeholder: "Show {cancelLink} in calendar invite templates",
    inline: true,
    stacked: false,
  },
} as const;
