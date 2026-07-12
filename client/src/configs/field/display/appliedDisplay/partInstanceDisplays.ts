
import { DISPLAY_LABELS, ENTITY_STATUS } from '@/constants/entityFieldConstants'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { DisplayFieldType } from '../displayFieldTypes'
import { baseEntityDisplays } from './baseEntityDisplays'

export const partInstanceDisplays = {
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

  active: {
    label: ENTITY_STATUS.ACTIVE,
    placeholder: "",
    inline: true,
    stacked: false,
    width: "auto",
    align: "center",
  },

  zeroOutPart: {
    label: "Zero Out Part",
    placeholder: "",
    inline: true,
    stacked: false,
    width: "auto",
    align: "center",
  },


  baseTime: {
    label: "Base Time (min)",
    placeholder: "",
    inline: false,
    stacked: true,
    width: "15%",
    align: "right",
    },

  timePerUnit: {
    label: "Time / unit",
    placeholder: "",
    inline: false,
    stacked: true,
    width: "15%",
    align: "right",
    },

  baseFee: {
    label: "Base Fee ($)",
    placeholder: "",
    inline: false,
    stacked: true,
    width: "15%",
    align: "right",
    },

  feePerUnit: {
    label: "Fee / unit ($)",
    placeholder: "",
    inline: false,
    stacked: true,
    width: "15%",
    align: "right",
  },
} satisfies Partial<Record<GlobalFieldKey<"partInstance">, DisplayFieldType<"partInstance", GlobalFieldKey<"partInstance">>>>;

