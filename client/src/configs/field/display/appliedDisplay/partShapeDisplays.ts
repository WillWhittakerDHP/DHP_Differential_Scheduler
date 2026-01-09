/**
 * LEARNING: PartShape Display Configs - Display configs for partShape fields
 * WHY: Defines labels, placeholders, and layout for partShape fields
 * PATTERN: Spreads baseEntityDisplays and adds entity-specific configs
 */

import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { DisplayFieldType } from '../fullFieldDisplayConfig'
import { baseEntityDisplays } from './baseEntityDisplays'

export const partShapeDisplays = {
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
} satisfies Partial<Record<GlobalFieldKey<"partShape">, DisplayFieldType<"partShape", GlobalFieldKey<"partShape">>>>;

