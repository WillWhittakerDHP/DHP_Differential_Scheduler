import { DISPLAY_LABELS, ENTITY_STATUS } from '@/constants/entityFieldConstants'

export const annotationInstanceDisplays = {
  id: {
    label: 'ID',
    placeholder: 'This Field Should Be Hidden',
    inline: false,
    stacked: false,
  },

  name: {
    label: DISPLAY_LABELS.NAME,
    placeholder: 'Label for this annotation instance',
    inline: false,
    stacked: true,
  },

  orderIndex: {
    label: 'Order Index',
    placeholder: 'This Field Should Be Hidden',
    inline: false,
    stacked: false,
  },

  active: {
    label: ENTITY_STATUS.ACTIVE,
    placeholder: ENTITY_STATUS.ACTIVE,
    inline: true,
    stacked: false,
  },

  /** Foreign key to annotation shape (template). */
  type: {
    label: 'Annotation shape',
    placeholder: 'Select the annotation shape template',
    inline: false,
    stacked: true,
  },

  text: {
    label: 'Default text',
    placeholder: 'Optional default copy for this instance',
    inline: false,
    stacked: true,
  },

  contentRows: {
    label: 'Content rows',
    placeholder: 'Per–user-type content (wizard)',
    inline: false,
    stacked: true,
  },
} as const
