/**
 * Pure helper: builds bulk-edit payload from form values (filtered metadata keys).
 * WHY: Moved from composables (utils-in-disguise) — no Vue reactivity; used by InstanceBulkEditModal and InstancesTab.
 */
export function buildBulkEditDataFromForm(
  filteredMetadataKeys: string[],
  formValues: Record<string, unknown>
): Record<string, number | null | undefined> {
  return filteredMetadataKeys.reduce<Record<string, number | null | undefined>>(
    (acc, field) => {
      const value = formValues[field]
      if (value !== null && value !== undefined && value !== '') {
        const numericValue = Number(value)
        if (!isNaN(numericValue)) {
          acc[field] = numericValue
        }
      }
      return acc
    },
    {}
  )
}
