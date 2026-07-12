
import { DISPLAY_LABELS } from '@/constants/entityFieldConstants'
import type { GlobalFieldKey } from '@/constants/primitives'
import type { DisplayFieldType } from '../displayFieldTypes'
import { baseEntityDisplays } from './baseEntityDisplays'

export const partShapeDisplays = {
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
} satisfies Partial<Record<GlobalFieldKey<"partShape">, DisplayFieldType<"partShape", GlobalFieldKey<"partShape">>>>;

