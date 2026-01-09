/**
 * LEARNING: BlockInstance Display Configs - Display configs for blockInstance fields
 * WHY: Defines labels, placeholders, and layout for blockInstance fields
 * PATTERN: Spreads baseEntityDisplays and adds entity-specific configs
 */

import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { DisplayFieldType } from '../fullFieldDisplayConfig'
import { baseEntityDisplays } from './baseEntityDisplays'

export const blockInstanceDisplays = {
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

  baseSqFt: {
    label: "Base Sq Ft",
    placeholder: "",
    inline: true,
    stacked: false,
    width: "auto",
    align: "right",
  },

  active: {
    label: "Active",
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

