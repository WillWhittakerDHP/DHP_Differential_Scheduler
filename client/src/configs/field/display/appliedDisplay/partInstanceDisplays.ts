/**
 * LEARNING: PartInstance Display Configs - Display configs for partInstance fields
 * WHY: Defines labels, placeholders, and layout for partInstance fields
 * PATTERN: Spreads baseEntityDisplays and adds entity-specific configs
 */

import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { DisplayFieldType } from '../fullFieldDisplayConfig'
import { baseEntityDisplays } from './baseEntityDisplays'

export const partInstanceDisplays = {
  ...baseEntityDisplays,

  name: {
    label: "Name",
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
    label: "Active",
    placeholder: "",
    inline: true,
    stacked: false,
    width: "auto",
    align: "center",
  },

  onSite: {
    label: "On Site?",
    placeholder: "",
    inline: true,
    stacked: false,
    width: "10%",
    align: "center",
    },

  clientPresent: {
    label: "Client Present?",
    placeholder: "",
    inline: true,
    stacked: false,
    width: "10%",
    align: "center",
    },

  moveable: {
    label: "Moveable?",
    placeholder: "",
    inline: true,
    stacked: false,
    width: "10%",
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

  rateOverBaseTime: {
    label: "Overtime Rate (time)",
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

  rateOverBaseFee: {
    label: "Overtime Rate ($)",
    placeholder: "",
    inline: false,
    stacked: true,
    width: "15%",
    align: "right",
  },
} satisfies Partial<Record<GlobalFieldKey<"partInstance">, DisplayFieldType<"partInstance", GlobalFieldKey<"partInstance">>>>;

