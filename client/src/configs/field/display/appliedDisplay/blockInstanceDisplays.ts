
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

} satisfies Partial<Record<GlobalFieldKey<"blockInstance">, DisplayFieldType<"blockInstance", GlobalFieldKey<"blockInstance">>>>;

