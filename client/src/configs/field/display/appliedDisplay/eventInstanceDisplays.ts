import { DISPLAY_LABELS, ENTITY_STATUS } from '@/constants/entityFieldConstants'

/**
 * LEARNING: EventInstance Display Configs (Configuration Data)
 * WHY: Defines labels, placeholders, and layout for EventInstance fields
 * PATTERN: Similar structure to entity display configs but for configuration data
 * NOTE: These are NOT entities, so they may not integrate into full display config system
 */

export const eventInstanceDisplays = {
  id: {
    label: "ID",
    placeholder: "This Field Should Be Hidden",
    inline: false,
    stacked: false,
  },

  name: {
    label: DISPLAY_LABELS.NAME,
    placeholder: "Enter event instance name",
    inline: false,
    stacked: true,
  },

  eventShapeRef: {
    label: "Event Shape",
    placeholder: "Select event shape",
    inline: false,
    stacked: true,
  },

  titleTemplate: {
    label: "Title Template",
    placeholder: "Template for event title (e.g., '{service} on {propertyType}')",
    inline: false,
    stacked: true,
  },

  descriptionTemplate: {
    label: "Description Template",
    placeholder: "Template for event description (e.g., '{clientName} - {propertyAddress}')",
    inline: false,
    stacked: true,
  },

  locationTemplate: {
    label: "Location Template",
    placeholder: "Template for event location (e.g., '{propertyAddress}')",
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
