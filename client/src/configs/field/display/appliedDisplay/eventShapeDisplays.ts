/**
 * LEARNING: EventShape Display Configs (Configuration Data)
 * WHY: Defines labels, placeholders, and layout for EventShape fields
 * PATTERN: Similar structure to entity display configs but for configuration data
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
    label: "Name",
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
    label: "Active",
    placeholder: "Active",
    inline: true,
    stacked: false,
  },
} as const;
