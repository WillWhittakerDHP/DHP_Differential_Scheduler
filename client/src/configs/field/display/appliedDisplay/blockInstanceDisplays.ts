
import { DISPLAY_LABELS } from '@/constants/entityFieldConstants'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { DisplayFieldType } from '../displayFieldTypes'
import { baseEntityDisplays } from './baseEntityDisplays'

export const blockInstanceDisplays = {
  ...baseEntityDisplays,

  name: {
    label: DISPLAY_LABELS.NAME,
    placeholder: "Give me a name",
    inline: false,
    stacked: true,
    width: "30%",
    align: "left",
    style: {
      margin: "auto",
      resize: "none",
      width: "100%",
      fontWeight: "bold",
      padding: "8px 4px",
      backgroundColor: "#f0f2f5",
      borderTop: "1px solid #ccc",
      borderBottom: "1px solid #ccc",
    },
  },

  orderIndex: {
    label: "Order Index",
    placeholder: "This should be hidden",
    inline: false,
    stacked: false,
    width: "5%",
    align: "left",
    style: { margin: "auto", resize: "none", width: "100%" },
  },

  composite: {
    label: "Composite",
    placeholder: "",
    tooltip:
      "Same-shape composition: this instance groups component instances of the same block shape. Unlike Orchestrator, it does not choose among allowed downstream scheduling options.",
    inline: true,
    stacked: false,
    width: "auto",
    align: "left",
  },

  orchestrator: {
    label: "Orchestrator",
    placeholder: "",
    tooltip:
      "Marks this instance as a coordinating/root option in the scheduling graph. Downstream instance links are configured separately and are not limited to orchestrators.",
    inline: true,
    stacked: false,
    width: "auto",
    align: "left",
  },

  accumulator: {
    label: "Accumulator",
    placeholder: "",
    tooltip:
      "Lateral inclusion gates: when this service is selected, include linked time characteristics only if the matching property fact is present (e.g. HVAC count). Not a user pick of those characteristics.",
    inline: true,
    stacked: false,
    width: "auto",
    align: "left",
  },

  wizardPlacement: {
    label: "Wizard placement",
    placeholder: "Choose where this appears",
    tooltip:
      "Where this instance appears in the booking wizard — Hidden: never shown; Base: a main wizard card; Additional: an add-on/extra; Option only: a nested option; Base or additional: available in both places.",
    inline: true,
    stacked: false,
    width: "auto",
    align: "left",
  },

  icon: {
    label: "Icon (optional)",
    placeholder: "e.g. 🧱 or custom path",
    inline: true,
    stacked: true,
  },

  allowMultiple: {
    label: "Allow Multiple",
    placeholder: "",
    tooltip: "When on, the booking wizard lets the customer select this instance more than once.",
    inline: true,
    stacked: false,
    width: "auto",
    align: "left",
  },

  requiresUnitNumber: {
    label: "Requires Unit Number",
    placeholder: "",
    tooltip: "For time/property instances: the property step must collect a unit number.",
    inline: true,
    stacked: false,
    width: "auto",
    align: "left",
  },

  preClosing: {
    label: "Pre-closing",
    placeholder: "",
    tooltip: "For service instances: gates availability rules tied to pre-closing appointments.",
    inline: true,
    stacked: false,
    width: "auto",
    align: "left",
  },

  isMultiFamily: {
    label: "Multi-family",
    placeholder: "",
    tooltip: "For time/property instances: marks multi-family property types for validation and display.",
    inline: true,
    stacked: false,
    width: "auto",
    align: "left",
  },

  requiresAgent: {
    label: "Requires agent",
    placeholder: "",
    tooltip: "For service instances: attendee/contact flows expect an agent on the appointment.",
    inline: true,
    stacked: false,
    width: "auto",
    align: "left",
  },

  semanticType: {
    label: "User role",
    placeholder: "Select canonical user role",
    inline: false,
    stacked: true,
    width: "20%",
    align: "left",
    tooltip:
      "User-type instances only: which booking role this instance represents (buyer, agent, etc.). At most one instance per role on a shape.",
  },

} satisfies Partial<Record<GlobalFieldKey<"blockInstance">, DisplayFieldType<"blockInstance", GlobalFieldKey<"blockInstance">>>>;

