/** Entity-like shape for active/disabled check without full Record<string, unknown>. */
export function isBookingEntityActive(
  entity: { disabled?: boolean; active?: boolean } | null | undefined
): boolean {
  if (!entity) return false
  const disabled = entity.disabled === true
  const active = entity.active !== false
  return !disabled && active
}
