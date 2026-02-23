import { DISPLAY_LABELS, ENTITY_STATUS } from '@/constants/entityFieldConstants'

/**
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

  visibility: {
    label: "Visibility",
    placeholder: "Who can see this event",
    inline: true,
    stacked: false,
  },

  transparency: {
    label: "Show As",
    placeholder: "Busy or Free",
    inline: true,
    stacked: false,
  },

  guestsCanModify: {
    label: "Guests Can Modify",
    placeholder: "Allow attendees to edit",
    inline: true,
    stacked: false,
  },

  guestsCanInviteOthers: {
    label: "Guests Can Invite Others",
    placeholder: "Allow attendees to add people",
    inline: true,
    stacked: false,
  },

  guestsCanSeeOtherGuests: {
    label: "Guests Can See Guest List",
    placeholder: "Allow attendees to see others",
    inline: true,
    stacked: false,
  },

  addConferenceLink: {
    label: "Google Meet",
    placeholder: "Add Meet link",
    inline: true,
    stacked: false,
  },

  sendUpdates: {
    label: "Send Invitations",
    placeholder: "Email invitation behavior",
    inline: true,
    stacked: false,
  },

  colorId: {
    label: "Event Color",
    placeholder: "Calendar color",
    inline: true,
    stacked: false,
  },

  status: {
    label: "Event Status",
    placeholder: "Confirmed or tentative",
    inline: true,
    stacked: false,
  },

  reminderOverrides: {
    label: "Reminder Overrides",
    placeholder: "Custom reminders",
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
