/**
 * LEARNING: Base Entity Displays - Common display configs for all entities
 * WHY: Shared display configs (id) used by all entities
 * PATTERN: Base displays spread into entity-specific display configs
 */

import type { GlobalEntityKey } from '../../../../constants/entities'
import type { GlobalFieldKey } from '../../../../constants/primitives'
import type { DisplayFieldType } from '../displayFieldTypes'

export const baseEntityDisplays = {
  id: {
    label: "ID",
    placeholder: "This should be hidden",
    inline: false,
    stacked: false,
    width: "5%",
    align: "left",
    style: { margin: "auto", resize: "none", width: "100%" },
  },

} satisfies Record<string, DisplayFieldType<GlobalEntityKey, GlobalFieldKey<GlobalEntityKey>>>;

