/**
 * LEARNING: BlockShape Display Configs - Display configs for blockShape fields
 * WHY: Defines labels, placeholders, and layout for blockShape fields
 * PATTERN: Spreads baseEntityDisplays and adds entity-specific configs
 */

import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { DisplayFieldType } from '../fullFieldDisplayConfig'
import { baseEntityDisplays } from './baseEntityDisplays'

export const blockShapeDisplays = {
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

  composable: {
    label: "Composable",
    placeholder: "Allow BlockInstances of this type to be composed together",
    inline: false,
    stacked: true,
    width: "20%",
    align: "center",
    tooltip: "When enabled, BlockInstances of this type can be composed together to share part instances and compose properties.",
  },
  
  constituable: {
    label: "State Control",
    placeholder: "BlockInstances of this type do not display or interact with PartInstances",
    inline: false,
    stacked: true,
    width: "20%",
    align: "center",
    tooltip: "When enabled (ON), BlockInstances of this BlockShape will not display or interact with PartInstances. Useful for state-only entities like User Types. When disabled (OFF), BlockInstances can have constituent part instances.",
  },
  
  type: {
    label: "Type",
    placeholder: "Select block shape type",
    inline: false,
    stacked: true,
    width: "20%",
    align: "left",
    tooltip: "Semantic type identifier for this block shape. Used for stable filtering independent of display name.",
  },
} satisfies Partial<Record<GlobalFieldKey<"blockShape">, DisplayFieldType<"blockShape", GlobalFieldKey<"blockShape">>>>;

