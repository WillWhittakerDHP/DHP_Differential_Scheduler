
import { DISPLAY_LABELS, ENTITY_STATUS } from '@/constants/entityFieldConstants'
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

  baseSqFt: {
    label: "Base Sq Ft",
    placeholder: "",
    inline: true,
    stacked: false,
    width: "auto",
    align: "right",
  },

  active: {
    label: ENTITY_STATUS.ACTIVE,
    placeholder: "",
    inline: true,
    stacked: false,
    width: "auto",
    align: "center",
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
      "When on, this instance selects which downstream instances are active from options already allowed on the block shape and relationships. It does not create new valid relationships.",
    inline: true,
    stacked: false,
    width: "auto",
    align: "left",
  },

  wizardVisible: {
    label: "Wizard visible",
    placeholder: "",
    tooltip:
      "When off, this instance is add-on / line-item style in the booking wizard. Visibility does not change which relationships are valid on the block shape.",
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
    style: { display: "none" },
  },

  allowMultiple: {
    label: "Allow Multiple",
    placeholder: "",
    inline: false,
    stacked: true,
    width: "15%",
    align: "left",
  },

  requiresUnitNumber: {
    label: "Requires Unit Number",
    placeholder: "",
    inline: false,
    stacked: true,
    width: "15%",
    align: "left",
  },

  /** Per-block overrides of scheduling weight keyed by event shape id (metadata-driven field). */
  differentialEventRoleOverrides: {
    label: "Event segment scheduling overrides",
    placeholder: "",
    tooltip:
      "Each event shape’s placement sets its default scheduling behavior. Override here only for this block instance.",
    inline: false,
    stacked: true,
  },

} satisfies Partial<Record<GlobalFieldKey<"blockInstance">, DisplayFieldType<"blockInstance", GlobalFieldKey<"blockInstance">>>>;

