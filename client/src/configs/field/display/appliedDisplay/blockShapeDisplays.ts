
import { DISPLAY_LABELS } from '@/constants/entityFieldConstants'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { DisplayFieldType } from '../displayFieldTypes'
import { baseEntityDisplays } from './baseEntityDisplays'

export const blockShapeDisplays = {
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

  semanticType: {
    label: "App-wide Semantic Type",
    placeholder: "Select app-wide semantic type",
    inline: false,
    stacked: true,
    width: "20%",
    align: "left",
    tooltip:
      "App-wide semantic type for this block shape. Used for stable filtering and booking behavior independent of display name.",
  },
} satisfies Partial<Record<GlobalFieldKey<"blockShape">, DisplayFieldType<"blockShape", GlobalFieldKey<"blockShape">>>>;

