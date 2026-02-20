/**
 * Shared select option types for admin and non-admin composables.
 * WHY: Breaks import-graph (useSelectOptions no longer imports from useSelectDomTargets).
 */

/** Base shape for select groups (group key + label). */
export interface SelectGroup {
  groupKey: string
  groupLabel: string
}
