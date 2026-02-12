/**
 * LEARNING: PartInstance Display Configs - Display configs for partInstance fields
 * WHY: Defines labels, placeholders, and layout for partInstance fields
 * PATTERN: Spreads baseEntityDisplays and adds entity-specific configs
 */

import { DISPLAY_LABELS, ENTITY_STATUS } from '../../../../constants/entityFieldConstants'
import type { GlobalFieldKey } from '../../../../constants/primitives'
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

